use serde_json::Value;
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::Spanned;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::noop_visit_type;
use swc_ecmascript::visit::Visit;

pub struct FontImportsGenerator<'a> {
    pub state: &'a mut super::State,
}

impl<'a> FontImportsGenerator<'a> {
    fn check_call_expr(&mut self, call_expr: &CallExpr, font_module_id: Option<Ident>) -> bool {
        if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Ident(ident) = &**callee_expr {
                if let Some(font_function) = self.state.font_functions.get(&ident.to_id()) {
                    self.state
                        .font_functions_in_allowed_scope
                        .insert(ident.span.lo);

                    if call_expr.args.len() > 1 {
                        HANDLER.with(|handler| {
                            handler
                                .struct_span_err(
                                    call_expr.span,
                                    "Font loaders only accepts 1 argument",
                                )
                                .emit()
                        });
                    }

                    let json = match call_expr.args.get(0) {
                        Some(ExprOrSpread { expr, spread }) => match spread {
                            Some(spread_span) => {
                                HANDLER.with(|handler| {
                                    handler
                                        .struct_span_err(
                                            *spread_span,
                                            "Font loaders don't accept spreads",
                                        )
                                        .emit()
                                });
                                Err(())
                            }
                            None => match &**expr {
                                Expr::Object(object_lit) => {
                                    let mut obj = object_lit_to_json(object_lit);
                                    if let Value::Object(ref mut values) = obj {
                                        values.insert(
                                            "font".to_string(),
                                            Value::String(String::from(&*font_function.font_name)),
                                        );
                                    }
                                    Ok(obj)
                                }
                                _ => {
                                    HANDLER.with(|handler| {
                                        handler
                                            .struct_span_err(
                                                call_expr.span,
                                                "Font loader must be called with an options object",
                                            )
                                            .emit()
                                    });
                                    Err(())
                                }
                            },
                        },
                        None => {
                            HANDLER.with(|handler| {
                                handler
                                    .struct_span_err(
                                        call_expr.span,
                                        "Font loader must be called with an options object",
                                    )
                                    .emit()
                            });
                            Err(())
                        }
                    };

                    if let Ok(json) = json {
                        self.state
                            .font_imports
                            .push(ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
                                src: Str {
                                    value: JsWord::from(format!(
                                        "{}?{}{}",
                                        font_function.loader,
                                        if font_module_id.is_some() {
                                            "module"
                                        } else {
                                            ""
                                        },
                                        json
                                    )),
                                    raw: None,
                                    span: DUMMY_SP,
                                },
                                specifiers: match font_module_id {
                                    Some(id) => {
                                        vec![ImportSpecifier::Default(ImportDefaultSpecifier {
                                            span: DUMMY_SP,
                                            local: id,
                                        })]
                                    }
                                    None => Vec::new(),
                                },
                                type_only: false,
                                asserts: None,
                                span: DUMMY_SP,
                            })));

                        return true;
                    }
                }
            }
        }

        false
    }
}

impl<'a> Visit for FontImportsGenerator<'a> {
    noop_visit_type!();

    fn visit_module_item(&mut self, item: &ModuleItem) {
        match item {
            ModuleItem::Stmt(Stmt::Decl(Decl::Var(var_decl))) => {
                if let Some(decl) = var_decl.decls.get(0) {
                    let ident = match &decl.name {
                        Pat::Ident(ident) => Ok(ident.id.clone()),
                        pattern => Err(pattern),
                    };
                    if let Some(expr) = &decl.init {
                        if let Expr::Call(call_expr) = &**expr {
                            if self.check_call_expr(call_expr, ident.clone().ok()) {
                                self.state.removeable_module_items.insert(var_decl.span.lo);

                                match var_decl.kind {
                                    VarDeclKind::Const => {}
                                    _ => {
                                        HANDLER.with(|handler| {
                                            handler
                                                .struct_span_err(
                                                    var_decl.span,
                                                    "Font loader result must be assigned to a \
                                                     const",
                                                )
                                                .emit()
                                        });
                                    }
                                }
                                if let Err(pattern) = ident {
                                    HANDLER.with(|handler| {
                                        handler
                                            .struct_span_err(
                                                pattern.span(),
                                                "With font modules enabled the result must be \
                                                 assigned to an identifier",
                                            )
                                            .emit()
                                    });
                                }
                            }
                        }
                    }
                }
            }
            ModuleItem::Stmt(Stmt::Expr(expr_stmt)) => {
                if let Expr::Call(call_expr) = &*expr_stmt.expr {
                    if self.check_call_expr(call_expr, None) {
                        self.state.removeable_module_items.insert(expr_stmt.span.lo);
                    }
                }
            }
            _ => {}
        }
    }
}

fn object_lit_to_json(object_lit: &ObjectLit) -> Value {
    let mut values = serde_json::Map::new();
    for prop in &object_lit.props {
        match prop {
            PropOrSpread::Prop(prop) => match &**prop {
                Prop::KeyValue(key_val) => {
                    let key = match &key_val.key {
                        PropName::Ident(ident) => Ok(String::from(&*ident.sym)),
                        key => {
                            HANDLER.with(|handler| {
                                handler
                                    .struct_span_err(key.span(), "Unexpected object key type")
                                    .emit()
                            });
                            Err(())
                        }
                    };
                    let val = expr_to_json(&*key_val.value);
                    match (key, val) {
                        (Ok(key), Ok(val)) => {
                            values.insert(key, val);
                        }
                        _ => {}
                    }
                }
                key => HANDLER.with(|handler| {
                    handler.struct_span_err(key.span(), "Unexpected key").emit();
                }),
            },
            PropOrSpread::Spread(spread_span) => HANDLER.with(|handler| {
                handler
                    .struct_span_err(spread_span.dot3_token, "Unexpected spread")
                    .emit();
            }),
        }
    }

    Value::Object(values)
}

fn expr_to_json(expr: &Expr) -> Result<Value, ()> {
    match expr {
        Expr::Lit(Lit::Str(str)) => Ok(Value::String(String::from(&*str.value))),
        Expr::Lit(Lit::Bool(Bool { value, .. })) => Ok(Value::Bool(*value)),
        Expr::Object(object_lit) => Ok(object_lit_to_json(object_lit)),
        Expr::Array(ArrayLit {
            elems,
            span: array_span,
            ..
        }) => {
            let elements: Result<Vec<Value>, ()> = elems
                .iter()
                .map(|e| {
                    if let Some(expr) = e {
                        match expr.spread {
                            Some(spread_span) => HANDLER.with(|handler| {
                                handler
                                    .struct_span_err(spread_span, "Unexpected spread")
                                    .emit();
                                Err(())
                            }),
                            None => expr_to_json(&*expr.expr),
                        }
                    } else {
                        HANDLER.with(|handler| {
                            handler
                                .struct_span_err(*array_span, "Unexpected empty value in array")
                                .emit();
                            Err(())
                        })
                    }
                })
                .collect();

            elements.map(Value::Array)
        }
        lit => HANDLER.with(|handler| {
            handler
                .struct_span_err(lit.span(), "Unexpected value")
                .emit();
            Err(())
        }),
    }
}
