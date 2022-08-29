use fxhash::FxHashSet;
use swc_atoms::JsWord;
use swc_common::collections::AHashMap;
use swc_common::{BytePos, Spanned};
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::{as_folder, noop_visit_mut_type, Fold, VisitMut, VisitWith};

mod find_functions_outside_module_scope;
mod font_functions_collector;
mod font_imports_generator;

pub fn next_font_loaders(font_loaders: Vec<String>) -> impl Fold + VisitMut {
    as_folder(NextFontLoaders {
        font_loaders,
        state: State {
            ..Default::default()
        },
    })
}

#[derive(Debug)]
pub struct FontFunction {
    loader: JsWord,
    font_name: JsWord,
}
#[derive(Debug, Default)]
pub struct State {
    font_functions: AHashMap<Id, FontFunction>,
    removeable_module_items: FxHashSet<BytePos>,
    font_imports: Vec<ModuleItem>,
    font_functions_in_allowed_scope: FxHashSet<BytePos>,
}

struct NextFontLoaders {
    font_loaders: Vec<String>,
    state: State,
}

impl VisitMut for NextFontLoaders {
    noop_visit_mut_type!();

    fn visit_mut_module_items(&mut self, items: &mut Vec<ModuleItem>) {
        // Find imported functions from font loaders
        let mut functions_collector = font_functions_collector::FontFunctionsCollector {
            font_loaders: &self.font_loaders,
            state: &mut self.state,
        };
        items.visit_with(&mut functions_collector);

        if !self.state.removeable_module_items.is_empty() {
            // Generate imports from usage
            let mut import_generator = font_imports_generator::FontImportsGenerator {
                state: &mut self.state,
            };
            items.visit_with(&mut import_generator);

            // Find font function refs in wrong scope
            let mut wrong_scope =
                find_functions_outside_module_scope::FindFunctionsOutsideModuleScope {
                    state: &mut self.state,
                };
            items.visit_with(&mut wrong_scope);

            // Remove marked module items
            items.retain(|item| !self.state.removeable_module_items.contains(&item.span_lo()));

            // Add font imports
            let mut new_items = Vec::new();
            new_items.append(&mut self.state.font_imports);
            new_items.append(items);
            *items = new_items;
        }
    }
}
