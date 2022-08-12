use serde_json::{Number, Value};
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::Spanned;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::noop_visit_type;
use swc_ecmascript::visit::Visit;

pub struct FontImportGenerator<'a> {
    pub state: &'a mut super::State,
}

impl<'a> FontImportGenerator<'a> {
    fn check_call_expr(&mut self, call_expr: &CallExpr, font_module_id: Option<Ident>) -> bool {
        if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Ident(ident) = &**callee_expr {
                if let Some(downloader) = self.state.font_functions.get(&ident.to_id()) {
                    if call_expr.args.len() > 1 {
                        HANDLER.with(|handler| {
                            handler
                                .struct_span_err(
                                    call_expr.span,
                                    "Font downloaders only accepts 1 argument",
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
                                            "Font downloaders don't accept spreads",
                                        )
                                        .emit()
                                });
                                Err(())
                            }
                            None => match &**expr {
                                Expr::Object(object_lit) => {
                                    Ok(object_lit_to_font_json(&*ident.sym, object_lit))
                                }
                                _ => {
                                    HANDLER.with(|handler| {
                                        handler
                                            .struct_span_err(
                                                call_expr.span,
                                                "Font downloader must be called with an options \
                                                 object",
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
                                        "Font downloader must be called with an options object",
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
                                    value: JsWord::from(format!("{}?{}", downloader, json)),
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

impl<'a> Visit for FontImportGenerator<'a> {
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
                                                    "Font downloader result must be assigned to a \
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
                                                "Font downloader result must be assigned to an \
                                                 identifier",
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

fn object_lit_to_font_json(font_name: &str, object_lit: &ObjectLit) -> Value {
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
                    let val = match &*key_val.value {
                        Expr::Lit(Lit::Str(str)) => Ok(Value::String(String::from(&*str.value))),
                        Expr::Array(ArrayLit { elems, .. }) => {
                            let elements: Result<Vec<Value>, ()> = elems
                                .iter()
                                .map(|e| {
                                    if let Some(expr) = e {
                                        match expr.spread {
                                            Some(spread_span) => HANDLER.with(|handler| {
                                                handler
                                                    .struct_span_err(
                                                        spread_span,
                                                        "Unexpected spread",
                                                    )
                                                    .emit();
                                                Err(())
                                            }),
                                            None => match &*expr.expr {
                                                Expr::Lit(Lit::Str(str)) => {
                                                    Ok(Value::String(String::from(&*str.value)))
                                                }
                                                _ => panic!(),
                                            },
                                        }
                                    } else {
                                        panic!()
                                    }
                                })
                                .collect();

                            match elements {
                                Ok(elements) => Ok(Value::Array(elements)),
                                Err(_) => Err(()),
                            }
                        }
                        _ => panic!("expected string lit"),
                    };
                    match (key, val) {
                        (Ok(key), Ok(val)) => {
                            values.insert(key, val);
                        }
                        _ => {}
                    }
                }
                _ => panic!("expected key value"),
            },
            PropOrSpread::Spread(_) => panic!("unexpected spread in prop"),
        }
    }

    values.insert("font".to_string(), Value::String(String::from(font_name)));

    Value::Object(values)
}
