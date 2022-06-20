use std::collections::HashMap;

use serde::Deserialize;
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::{Fold, FoldWith};

pub fn next_font(config: Config) -> impl Fold {
    println!("CREATING NEXT FONT: {:#?}", config);
    NextFont { config }
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub preload_font_files: Option<Vec<String>>,
    pub import_css_files: Option<Vec<String>>,
}

// #[derive(Debug)]
struct NextFont {
    config: Config,
}

impl Fold for NextFont {
    // fn fold_call_expr(&mut self, mut expr: CallExpr) -> CallExpr {
    //     if let Callee::Expr(i) = &expr.callee {
    //         if let Expr::Ident(identifier) = &**i {
    //             if &identifier.sym == "preloadFont" {
    //                 if expr.args.len() != 1 {
    //                     panic!("AHH1");
    //                 }
    //                 let arg = &expr.args[0];
    //                 if arg.spread.is_some() {
    //                     panic!("AHH2");
    //                 }

    //                 let font_name = if let Expr::Lit(Lit::Str(str)) = &*arg.expr
    // {                     &*str.value
    //                 } else {
    //                     panic!("AHH3");
    //                 };

    //                 let font_file = match self.config.fonts.get(font_name) {
    //                     Some(file) => file,
    //                     None => panic!("AHH"),
    //                 };

    //                 expr.args[0] = ExprOrSpread {
    //                     spread: None,
    //                     expr: Box::new(Expr::Lit(Lit::Str(Str {
    //                         value: JsWord::from(font_file.path.clone()),
    //                         span: DUMMY_SP,
    //                         raw: None,
    //                     }))),
    //                 };
    //             }
    //         }
    //     }
    //     expr
    // }

    fn fold_export_default_decl(
        &mut self,
        mut export_default_decl: ExportDefaultDecl,
    ) -> ExportDefaultDecl {
        match &mut export_default_decl.decl {
            DefaultDecl::Fn(FnExpr {  function: Function { body: Some(BlockStmt {  stmts,.. }), .. },..}) => {
                tracing::debug!("stmts: {:?}", stmts);
                if let Some(font_files) = &self.config.preload_font_files {
                    for font_file in font_files {
                        stmts.insert(0, Stmt::Expr(ExprStmt {
                            span: DUMMY_SP,
                            expr: Box::new(Expr::Call(CallExpr {
                                span: DUMMY_SP,
                                type_args: None,
                                args: vec![ExprOrSpread {
                                    spread: None,
                                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                                        raw: None,
                                        span: DUMMY_SP,
                                        value: JsWord::from(font_file.clone()),
                                    }))),
                                }],
                                callee: Callee::Expr(Box::new(Expr::Ident(Ident {
                                    optional: false,
                                    span: DUMMY_SP,
                                    sym: JsWord::from("preloadFont"),
                                })))
                            }))
                        }));
                    }
                }
            },
            _ => panic!()
            // DefaultDecl::Class(_) => todo!(),
            // DefaultDecl::TsInterfaceDecl(_) => todo!(),
        }
        export_default_decl
    }

    fn fold_module_items(&mut self, mut items: Vec<ModuleItem>) -> Vec<ModuleItem> {
        items = items.fold_children_with(self);

        if let Some(import_css_files) = &self.config.import_css_files {
            for import in import_css_files {
                // varna om den redan finns sedan innan
                items.insert(
                    0,
                    ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
                        asserts: None,
                        span: DUMMY_SP,
                        type_only: false,
                        specifiers: Vec::new(),
                        src: Str {
                            span: DUMMY_SP,
                            value: JsWord::from(import.clone()),
                            raw: None,
                        },
                    })),
                );
            }
        }

        if self.config.preload_font_files.is_some() {
            // varna om den redan finns sedan innan
            items.insert(
                0,
                ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
                    asserts: None,
                    span: DUMMY_SP,
                    type_only: false,
                    specifiers: vec![ImportSpecifier::Named(ImportNamedSpecifier {
                        imported: None,
                        is_type_only: false,
                        local: Ident {
                            sym: "preloadFont".into(),
                            span: DUMMY_SP,
                            optional: false,
                        },
                        span: DUMMY_SP,
                    })],
                    src: Str {
                        span: DUMMY_SP,
                        value: "next/font".into(),
                        raw: None,
                    },
                })),
            );
        }

        items
    }
}
