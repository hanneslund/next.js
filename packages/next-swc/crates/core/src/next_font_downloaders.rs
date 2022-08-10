use easy_error::{bail, Error};
use fxhash::FxHashSet;
use serde_json::{json, Number, Value};
use std::cell::RefCell;
use std::collections::HashMap;
use std::mem::take;
use std::rc::Rc;
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::pass::{Repeat, Repeated};
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::FoldWith;
use swc_ecmascript::visit::{noop_fold_type, Fold};

use swc_common::pass::Optional;
use swc_ecmascript::ast::*;

pub fn next_font_downloaders(font_downloaders: Vec<String>) -> impl Fold {
    NextFontDownloaders {
        font_downloaders,
        ..Default::default()
    }
}

#[derive(Debug, Default)]
struct NextFontDownloaders {
    font_downloaders: Vec<String>,
    font_functions: FxHashSet<Id>,
}

impl Fold for NextFontDownloaders {
    fn fold_module_items(&mut self, items: Vec<ModuleItem>) -> Vec<ModuleItem> {
        for module_item in &items {
            match module_item {
                ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
                    if self
                        .font_downloaders
                        .contains(&String::from(&*import_decl.src.value))
                    {
                        for specifier in &import_decl.specifiers {
                            match specifier {
                                ImportSpecifier::Named(ImportNamedSpecifier { local, .. }) => {
                                    self.font_functions.insert(local.to_id());
                                }
                                _ => panic!("UNEXPECTED IMPORT"),
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        let mut imports: Vec<ModuleItem> = Vec::new();
        let mut new_items: Vec<ModuleItem> = Vec::new();
        for item in &items {
            match item {
                ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
                    if self
                        .font_downloaders
                        .contains(&String::from(&*import_decl.src.value))
                    {
                        continue;
                    }
                }
                ModuleItem::Stmt(Stmt::Decl(Decl::Var(var_decl))) => {
                    // let mut found = false
                    if let Some(decl) = var_decl.decls.get(0) {
                        let name: Option<Ident> = if let Pat::Ident(ident) = &decl.name {
                            Some(ident.id.clone())
                        } else {
                            None
                        };
                        if let Some(expr) = &decl.init {
                            match &**expr {
                                Expr::Call(call_expr) => {
                                    match &call_expr.callee {
                                        Callee::Expr(callee_expr) => {
                                            match &**callee_expr {
                                                Expr::Ident(ident) => {
                                                    if self.font_functions.contains(&ident.to_id())
                                                    {
                                                        // match var_decl.kind {
                                                        //     VarDeclKind::Const => {}
                                                        //     _ => panic!("Expected const
                                                        // declaration"),
                                                        // }
                                                        // if var_decl.decls.len() !== 1 {

                                                        // }

                                                        //length == 1
                                                        let json = match call_expr.args.get(0) {
                                                            Some(ExprOrSpread { expr, spread }) => {
                                                                if spread.is_some() {
                                                                    panic!("SPREAD FOUND")
                                                                }
                                                                match &**expr {
                                                                    Expr::Object(ObjectLit {
                                                                        props,
                                                                        ..
                                                                    }) => {
                                                                        // length? måste ha weight?
                                                                        let mut values =
                                                                            serde_json::Map::new();

                                                                        // props.iter().
                                                                        // for_each(|prop| {
                                                                        for prop in props {
                                                                            match prop {
                                                                                PropOrSpread::Prop(prop) => {
                                                                                    match &**prop {
                                                                                        Prop::KeyValue(key_val) => {
                                                                                            let key = match &key_val.key  {
                                                                                                PropName::Ident(ident) => String::from(&*ident.sym),
                                                                                                _ => panic!("expected ident")
                                                                                            };
                                                                                            let val = match &*key_val.value  {
                                                                                                Expr::Lit(Lit::Str(str)) => {
                                                                                                    Value::String(String::from(&*str.value))
                                                                                                },
                                                                                                _ => panic!("expected string lit")
                                                                                            };
                                                                                            values.insert(key, val);
                                                                                },
                                                                                _ => panic!("expected key value")
                                                                            }
                                                                        },
                                                                        PropOrSpread::Spread(_) => panic!("unexpected spread in prop"),
                                                                    }
                                                                        }

                                                                        values.insert(
                                                                            "font".to_string(),
                                                                            Value::String(
                                                                                String::from(
                                                                                    &*ident.sym,
                                                                                ),
                                                                            ),
                                                                        );
                                                                        Value::Object(values)
                                                                    }
                                                                    _ => panic!("expected object"),
                                                                }
                                                            }
                                                            None => panic!("AAAHH"),
                                                        };

                                                        imports.push(ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
                                                        src: Str {
                                                            value: JsWord::from(
                                                                format!("@next/google-fonts?d={}", json),
                                                            ),
                                                            raw: None,
                                                            span: DUMMY_SP,
                                                        },
                                                        specifiers: match name {
                                                            Some(id) => {
                                                                vec![ImportSpecifier::Default(
                                                                    ImportDefaultSpecifier {
                                                                        span: DUMMY_SP,
                                                                        local: id,                                                                    },
                                                                )]
                                                            }
                                                            None => Vec::new(),
                                                        },
                                                        type_only: false,
                                                        asserts: None,
                                                        span: DUMMY_SP,
                                                    }),
                                                ));
                                                        continue;
                                                    }
                                                }
                                                _ => {}
                                            }
                                        }
                                        _ => {}
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                }
                _ => {}
            }
            new_items.push(item.clone());
        }

        imports.append(&mut new_items);
        imports
    }
}
