use swc_common::errors::HANDLER;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::noop_visit_type;
use swc_ecmascript::visit::Visit;

pub struct FontFunctionsCollector<'a> {
    pub font_downloaders: &'a [String],
    pub state: &'a mut super::State,
}

impl<'a> Visit for FontFunctionsCollector<'a> {
    noop_visit_type!();

    fn visit_import_decl(&mut self, import_decl: &ImportDecl) {
        if self
            .font_downloaders
            .contains(&String::from(&*import_decl.src.value))
        {
            self.state
                .removeable_module_items
                .insert(import_decl.span.lo);
            for specifier in &import_decl.specifiers {
                match specifier {
                    ImportSpecifier::Named(ImportNamedSpecifier { local, .. }) => {
                        self.state
                            .font_functions_in_allowed_scope
                            .insert(local.span.lo);
                        self.state
                            .font_functions
                            .insert(local.to_id(), import_decl.src.value.clone());
                    }
                    _ => {
                        HANDLER.with(|handler| {
                            handler
                                .struct_span_err(
                                    import_decl.span,
                                    "Font downloaders can only have named imports",
                                )
                                .emit()
                        });
                    }
                }
            }
        }
    }
}
