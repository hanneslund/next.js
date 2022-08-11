use serde_json::{Number, Value};
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::noop_visit_type;
use swc_ecmascript::visit::Visit;

pub struct FontImportGenerator<'a> {
    pub state: &'a mut super::State,
}

impl<'a> Visit for FontImportGenerator<'a> {
    noop_visit_type!();

    fn visit_module_item(&mut self, item: &ModuleItem) {
        if let ModuleItem::Stmt(Stmt::Decl(Decl::Var(var_decl))) = item {
            if let Some(decl) = var_decl.decls.get(0) {
                let name: Option<Ident> = if let Pat::Ident(ident) = &decl.name {
                    Some(ident.id.clone())
                } else {
                    None
                };
                if let Some(expr) = &decl.init {
                    if let Expr::Call(call_expr) = &**expr {
                        if let Callee::Expr(callee_expr) = &call_expr.callee {
                            if let Expr::Ident(ident) = &**callee_expr {
                                if self.state.font_functions.contains(&ident.to_id()) {
                                    self.state.removeable_module_items.insert(var_decl.span.lo);

                                    let json = match call_expr.args.get(0) {
                                        Some(ExprOrSpread { expr, spread }) => {
                                            if spread.is_some() {
                                                panic!("SPREAD FOUND")
                                            }
                                            match &**expr {
                                                Expr::Object(object_lit) => {
                                                    object_lit_to_font_json(&*ident.sym, object_lit)
                                                }
                                                _ => panic!("expected object"),
                                            }
                                        }
                                        None => panic!("expected argument to font function"),
                                    };

                                    self.state.font_imports.push(ModuleItem::ModuleDecl(
                                        ModuleDecl::Import(ImportDecl {
                                            src: Str {
                                                value: JsWord::from(format!(
                                                    "@next/google-fonts?{}",
                                                    json
                                                )),
                                                raw: None,
                                                span: DUMMY_SP,
                                            },
                                            specifiers: match name {
                                                Some(id) => {
                                                    vec![ImportSpecifier::Default(
                                                        ImportDefaultSpecifier {
                                                            span: DUMMY_SP,
                                                            local: id,
                                                        },
                                                    )]
                                                }
                                                None => Vec::new(),
                                            },
                                            type_only: false,
                                            asserts: None,
                                            span: DUMMY_SP,
                                        }),
                                    ));
                                }
                            }
                        }
                    }
                }
            }
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
                        PropName::Ident(ident) => String::from(&*ident.sym),
                        _ => panic!("expected ident"),
                    };
                    let val = match &*key_val.value {
                        Expr::Lit(Lit::Str(str)) => Value::String(String::from(&*str.value)),
                        Expr::Array(ArrayLit { elems, .. }) => Value::Array(
                            elems
                                .iter()
                                .map(|e| {
                                    if let Some(expr) = e {
                                        if expr.spread.is_some() {
                                            panic!("Unexpected spread");
                                        }
                                        match &*expr.expr {
                                            Expr::Lit(Lit::Str(str)) => {
                                                Value::String(String::from(&*str.value))
                                            }
                                            _ => panic!(),
                                        }
                                    } else {
                                        panic!()
                                    }
                                })
                                .collect(),
                        ),
                        _ => panic!("expected string lit"),
                    };
                    values.insert(key, val);
                }
                _ => panic!("expected key value"),
            },
            PropOrSpread::Spread(_) => panic!("unexpected spread in prop"),
        }
    }

    values.insert("font".to_string(), Value::String(String::from(font_name)));

    Value::Object(values)
}
