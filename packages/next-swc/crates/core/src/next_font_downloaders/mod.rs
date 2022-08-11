use fxhash::FxHashSet;
use swc_common::errors::HANDLER;
use swc_common::{BytePos, Spanned};
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::{as_folder, noop_visit_mut_type, Fold, VisitMut, VisitWith};

mod font_functions_collector;
mod font_import_generator;

pub fn next_font_downloaders(font_downloaders: Vec<String>) -> impl Fold + VisitMut {
    as_folder(NextFontDownloaders {
        font_downloaders,
        state: State {
            ..Default::default()
        },
    })
}

#[derive(Debug, Default)]
pub struct State {
    font_functions: FxHashSet<Id>,
    removeable_module_items: FxHashSet<BytePos>,
    font_imports: Vec<ModuleItem>,
}

struct NextFontDownloaders {
    font_downloaders: Vec<String>,
    state: State,
}

impl VisitMut for NextFontDownloaders {
    noop_visit_mut_type!();

    fn visit_mut_module_items(&mut self, mut items: &mut Vec<ModuleItem>) {
        let mut functions_collector = font_functions_collector::FontFunctionsCollector {
            font_downloaders: &self.font_downloaders,
            state: &mut self.state,
        };
        items.visit_with(&mut functions_collector);

        // bara om removeable_module_items finns?
        let mut import_generator = font_import_generator::FontImportGenerator {
            state: &mut self.state,
        };
        items.visit_with(&mut import_generator);

        tracing::debug!("{:#?}", self.state);

        // Remove tagged module items
        items.retain(|item| !self.state.removeable_module_items.contains(&item.span_lo()));

        // Add font imports
        let mut new_items = Vec::new();
        new_items.append(&mut self.state.font_imports);
        new_items.append(items);
        *items = new_items;
    }
}
