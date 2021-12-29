use swc_atoms::JsWord;
use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
// use swc_ecmascript::utils::HANDLER;
use swc_ecmascript::visit::{noop_fold_type, Fold, FoldWith};

pub fn next_css_utils() -> impl Fold {
    CssUtils {
        classes: String::from(""),
        css_compiler: css::compiler::Compiler::new(),
        at_root: true,
    }
}

struct CssUtils {
    classes: String,
    css_compiler: css::compiler::Compiler,
    at_root: bool,
}
impl Fold for CssUtils {
    noop_fold_type!();

    fn fold_jsx_element(&mut self, mut e: JSXElement) -> JSXElement {
        e.opening.attrs.retain(|attr| {
            if let JSXAttrOrSpread::JSXAttr(jsxattr) = attr {
                if let JSXAttrName::Ident(ref iden) = jsxattr.name {
                    if &*iden.sym == "ecss" {
                        match &jsxattr.value {
                            Some(JSXAttrValue::Lit(Lit::Str(str))) => {
                                self.classes = String::from(&*str.value);
                            }
                            _ => panic!("WRONG VAL"),
                        }

                        return false;
                    }
                }
            }

            true
        });

        if !self.classes.is_empty() {
            let class_names = self.css_compiler.generate_classes(&self.classes).join(" ");

            match e.opening.attrs.iter().enumerate().position(|(_, attr)| {
                if let JSXAttrOrSpread::JSXAttr(jsxattr) = attr {
                    if let JSXAttrName::Ident(ref iden) = jsxattr.name {
                        if &*iden.sym == "className" {
                            return true;
                        }
                    }
                }

                false
            }) {
                Some(index) => {
                    let current_value =
                        if let JSXAttrOrSpread::JSXAttr(jsxattr) = &e.opening.attrs[index] {
                            match &jsxattr.value {
                                Some(JSXAttrValue::Lit(Lit::Str(str))) => &*str.value,
                                _ => panic!("ERRO VALUE"),
                            }
                        } else {
                            unreachable!("we know there's something at that index");
                        };

                    e.opening.attrs[index] = JSXAttrOrSpread::JSXAttr(JSXAttr {
                        name: JSXAttrName::Ident(Ident {
                            sym: JsWord::from("className"),
                            optional: false,
                            span: DUMMY_SP,
                        }),
                        span: DUMMY_SP,
                        value: Some(JSXAttrValue::Lit(Lit::Str(Str {
                            value: JsWord::from(format!("{} {}", current_value, class_names)),
                            span: DUMMY_SP,
                            has_escape: false,
                            kind: StrKind::Synthesized,
                        }))),
                    });
                }
                None => e.opening.attrs.push(JSXAttrOrSpread::JSXAttr(JSXAttr {
                    name: JSXAttrName::Ident(Ident {
                        sym: JsWord::from("className"),
                        optional: false,
                        span: DUMMY_SP,
                    }),
                    span: DUMMY_SP,
                    value: Some(JSXAttrValue::Lit(Lit::Str(Str {
                        value: JsWord::from(class_names),
                        span: DUMMY_SP,
                        has_escape: false,
                        kind: StrKind::Synthesized,
                    }))),
                })),
            }
        }

        self.classes.clear();
        let at_root = self.at_root;

        self.at_root = false;
        let mut e = e.fold_children_with(self);

        if at_root {
            let generated_css = self.css_compiler.get_css();

            if !generated_css.is_empty() {
                e.children
                    .push(JSXElementChild::JSXElement(Box::new(JSXElement {
                        opening: JSXOpeningElement {
                            name: JSXElementName::Ident(Ident {
                                sym: JsWord::from("style"),
                                optional: false,
                                span: DUMMY_SP,
                            }),
                            attrs: vec![JSXAttrOrSpread::JSXAttr(JSXAttr {
                                name: JSXAttrName::Ident(Ident {
                                    sym: JsWord::from("jsx"),
                                    optional: false,
                                    span: DUMMY_SP,
                                }),
                                span: DUMMY_SP,
                                value: None,
                            })],
                            span: DUMMY_SP,
                            type_args: None,
                            self_closing: false,
                        },
                        closing: Some(JSXClosingElement {
                            name: JSXElementName::Ident(Ident {
                                sym: JsWord::from("style"),
                                optional: false,
                                span: DUMMY_SP,
                            }),
                            span: DUMMY_SP,
                        }),
                        children: vec![JSXElementChild::JSXExprContainer(JSXExprContainer {
                            expr: JSXExpr::Expr(Box::new(Expr::Tpl(Tpl {
                                quasis: vec![TplElement {
                                    cooked: None,
                                    raw: Str {
                                        value: JsWord::from(generated_css),
                                        has_escape: false,
                                        span: DUMMY_SP,
                                        kind: StrKind::Synthesized,
                                    },
                                    tail: false,
                                    span: DUMMY_SP,
                                }],
                                exprs: Vec::new(),
                                span: DUMMY_SP,
                            }))),
                            span: DUMMY_SP,
                        })],
                        span: DUMMY_SP,
                    })));
            }
        }

        self.at_root = true;
        e
    }
}
