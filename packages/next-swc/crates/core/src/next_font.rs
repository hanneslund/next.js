use std::collections::HashMap;

use serde::Deserialize;
use swc_atoms::JsWord;
use swc_common::errors::HANDLER;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::{
    CallExpr, Callee, Expr, ExprOrSpread, ImportDecl, Lit, ModuleDecl, ModuleItem, Str,
};
use swc_ecmascript::visit::{Fold, FoldWith};

pub fn next_font(config: Config, is_app_file: bool) -> impl Fold {
    NextFont {
        config,
        is_app_file,
    }
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub fonts: HashMap<String, FontData>,
    pub fonts_css_file: String,
}

// #[derive(Debug)]
struct NextFont {
    config: Config,
    is_app_file: bool,
}

#[derive(Clone, Debug, Deserialize)]
// #[derive(Clone, Debug, Deserialize)]
pub struct FontData {
    family: String,
    path: String,
}

impl Fold for NextFont {
    fn fold_call_expr(&mut self, mut expr: CallExpr) -> CallExpr {
        if let Callee::Expr(i) = &expr.callee {
            if let Expr::Ident(identifier) = &**i {
                if &identifier.sym == "preloadFont" {
                    if expr.args.len() != 1 {
                        panic!("AHH1");
                    }
                    let arg = &expr.args[0];
                    if arg.spread.is_some() {
                        panic!("AHH2");
                    }

                    let font_name = if let Expr::Lit(Lit::Str(str)) = &*arg.expr {
                        &*str.value
                    } else {
                        panic!("AHH3");
                    };

                    let font_file = match self.config.fonts.get(font_name) {
                        Some(file) => file,
                        None => panic!("AHH"),
                    };

                    expr.args[0] = ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            value: JsWord::from(font_file.path.clone()),
                            span: DUMMY_SP,
                            raw: None,
                        }))),
                    };
                }
            }
        }
        expr
    }

    fn fold_module_items(&mut self, mut items: Vec<ModuleItem>) -> Vec<ModuleItem> {
        items = items.fold_children_with(self);
        if self.is_app_file {
            // hamnar den sist nu?
            // varna om den redan finns sedan innan
            items.push(font_css_import_decl(&self.config.fonts_css_file));
        }
        items
    }
}

// ERROR IF ALREADY EXISTS
pub fn font_css_import_decl(fonts_file: &str) -> ModuleItem {
    ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
        asserts: None,
        span: DUMMY_SP,
        type_only: false,
        specifiers: Vec::new(),
        src: Str {
            span: DUMMY_SP,
            value: fonts_file.into(),
            raw: None,
        },
    }))
}
