use swc_common::errors::HANDLER;
use swc_ecmascript::ast::*;
use swc_ecmascript::visit::noop_visit_type;
use swc_ecmascript::visit::Visit;

pub struct FindFunctionsOutsideModuleScope<'a> {
    pub state: &'a mut super::State,
}

impl<'a> Visit for FindFunctionsOutsideModuleScope<'a> {
    noop_visit_type!();

    fn visit_ident(&mut self, ident: &Ident) {
        if self.state.font_functions.get(&ident.to_id()).is_some()
            && self
                .state
                .font_functions_in_allowed_scope
                .get(&ident.span.lo)
                .is_none()
        {
            HANDLER.with(|handler| {
                handler
                    .struct_span_err(
                        ident.span,
                        "Font downloaders can only be used in the module scope",
                    )
                    .emit()
            });
        }
    }
}
