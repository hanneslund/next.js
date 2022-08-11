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

    fn visit_module_item(&mut self, item: &ModuleItem) {
        match item {
            ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
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
                                self.state.font_functions.insert(local.to_id());
                            }
                            _ => panic!("UNEXPECTED IMPORT"),
                        }
                    }
                }
            }
            _ => {}
        }
    }
}
