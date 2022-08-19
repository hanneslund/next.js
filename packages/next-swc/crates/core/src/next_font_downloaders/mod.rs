use fxhash::FxHashSet;
use swc_atoms::JsWord;
use swc_common::collections::AHashMap;
use swc_common::{BytePos, Spanned};
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::{as_folder, noop_visit_mut_type, Fold, VisitMut, VisitWith};

mod find_functions_outside_module_scope;
mod font_functions_collector;
mod font_imports_generator;

pub fn next_font_downloaders(
    font_downloaders: Vec<String>,
    font_modules: bool,
) -> impl Fold + VisitMut {
    as_folder(NextFontDownloaders {
        font_downloaders,
        font_modules,
        state: State {
            ..Default::default()
        },
    })
}

#[derive(Debug)]
pub struct FontFunction {
    downloader: JsWord,
    font_name: JsWord,
}
#[derive(Debug, Default)]
pub struct State {
    font_functions: AHashMap<Id, FontFunction>,
    removeable_module_items: FxHashSet<BytePos>,
    font_imports: Vec<ModuleItem>,
    font_functions_in_allowed_scope: FxHashSet<BytePos>,
}

struct NextFontDownloaders {
    font_downloaders: Vec<String>,
    font_modules: bool,
    state: State,
}

impl VisitMut for NextFontDownloaders {
    noop_visit_mut_type!();

    fn visit_mut_module_items(&mut self, items: &mut Vec<ModuleItem>) {
        // Find imported functions from font downloaders
        let mut functions_collector = font_functions_collector::FontFunctionsCollector {
            font_downloaders: &self.font_downloaders,
            state: &mut self.state,
        };
        items.visit_with(&mut functions_collector);

        if !self.state.removeable_module_items.is_empty() {
            // Generate imports from usage
            let mut import_generator = font_imports_generator::FontImportsGenerator {
                state: &mut self.state,
                font_modules: self.font_modules,
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
