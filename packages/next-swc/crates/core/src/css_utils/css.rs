use std::str::Chars;

pub fn get_css_generator() -> CssGenerator {
    CssGenerator {
        class_name_nr: 0,
        generated_css_classes: Vec::new(),
    }
}
pub struct CssGenerator {
    class_name_nr: u32,
    generated_css_classes: Vec<String>,
}

type ClassName = String;
impl CssGenerator {
    pub fn add_css(&mut self, css_utils: &String) -> ClassName {
        let css: String = self.parse_css_utils(css_utils);

        self.generated_css_classes.push(String::from(format!(
            "._nextcss{}{{{}}}",
            self.class_name_nr, css
        )));

        let class_name = String::from(format!("_nextcss{}", self.class_name_nr));
        self.class_name_nr += 1;
        class_name
    }

    pub fn get_css(&mut self) -> String {
        let css = self.generated_css_classes.join("");
        self.generated_css_classes.clear();
        css
    }

    fn parse_css_utils(&self, css_utils: &String) -> String {
        let mut generated_css = String::from("");
        let mut chars = css_utils.chars();

        loop {
            if let Some(css) = self.parse_css_util(&mut chars) {
                generated_css.push_str(&*css);
            } else {
                break;
            }
        }

        generated_css
    }

    fn parse_css_util(&self, chars: &mut Chars) -> Option<String> {
        let (part, has_dash) = self.parse_util_part(chars);
        if part.is_empty() {
            return None;
        }
        let css = match (&*part, has_dash) {
            // Layout
            ("block", false) => String::from("display:block;"),
            ("inline", false) => String::from("display:inline;"),
            ("flex", false) => String::from("display:flex;"),
            ("grid", false) => String::from("display:grid;"),
            ("hidden", false) => String::from("display:none;"),
            ("inline", true) => self.parse_inline_display(chars),

            ("static", false) => String::from("position:static;"),
            ("fixed", false) => String::from("position:fixed;"),
            ("absolute", false) => String::from("position:absolute;"),
            ("relative", false) => String::from("position:relative;"),
            ("sticky", false) => String::from("position:sticky;"),

            ("visible", false) => String::from("visibility:visible;"),
            ("invisible", false) => String::from("visibility:hidden;"),

            // Flexbox and grid
            // ("flex", true) => {
            //     let (part, has_dash) = self.parse_util_part(chars);

            //     // flex-row	flex-direction: row;
            //     // flex-row-reverse	flex-direction: row-reverse;
            //     // flex-col	flex-direction: column;
            //     // flex-col-reverse	flex-direction: column-reverse;

            //     // flex-wrap	flex-wrap: wrap;
            //     // flex-wrap-reverse	flex-wrap: wrap-reverse;
            //     // flex-nowrap	flex-wrap: nowrap;

            //     // flex-1	flex: 1 1 0%;
            //     // flex-auto	flex: 1 1 auto;
            //     // flex-initial	flex: 0 1 auto;
            //     // flex-none	flex: none;

            //     // flex-grow-0	flex-grow: 0;
            //     // flex-grow	flex-grow: 1;

            //     // flex-shrink-0	flex-shrink: 0;
            //     // flex-shrink	flex-shrink: 1;
            // }
            // ("grid", true) => {
            //     let (part, has_dash) = self.parse_util_part(chars);

            //     // grid-cols-1	grid-template-columns: repeat(1, minmax(0, 1fr));
            //     // grid-cols-2	grid-template-columns: repeat(2, minmax(0, 1fr));
            //     // grid-cols-3	grid-template-columns: repeat(3, minmax(0, 1fr));
            //     // grid-cols-4	grid-template-columns: repeat(4, minmax(0, 1fr));
            //     // grid-cols-5	grid-template-columns: repeat(5, minmax(0, 1fr));
            //     // grid-cols-6	grid-template-columns: repeat(6, minmax(0, 1fr));
            //     // grid-cols-7	grid-template-columns: repeat(7, minmax(0, 1fr));
            //     // grid-cols-8	grid-template-columns: repeat(8, minmax(0, 1fr));
            //     // grid-cols-9	grid-template-columns: repeat(9, minmax(0, 1fr));
            //     // grid-cols-10	grid-template-columns: repeat(10, minmax(0,
            //     // 1fr)); grid-cols-11	grid-template-columns:
            //     // repeat(11, minmax(0, 1fr)); grid-cols-12
            //     // grid-template-columns: repeat(12, minmax(0, 1fr));
            //     // grid-cols-none	grid-template-columns: none;
            // }
            ("gap", true) => self.parse_spacing(vec!["gap"], chars),
            // ("justify", true) => {
            //     let (part, has_dash) = self.parse_util_part(chars);

            //     // justify-start	justify-content: flex-start;
            //     // justify-end	justify-content: flex-end;
            //     // justify-center	justify-content: center;
            //     // justify-between	justify-content: space-between;
            //     // justify-around	justify-content: space-around;
            //     // justify-evenly	justify-content: space-evenly;
            // }
            // ("items", true) => {
            //     let (part, has_dash) = self.parse_util_part(chars);

            // // items-start	align-items: flex-start;
            // // items-end	align-items: flex-end;
            // // items-center	align-items: center;
            // // items-baseline	align-items: baseline;
            // // items-stretch	align-items: stretch;
            // }

            // Spacing
            ("p", true) => self.parse_spacing(vec!["padding"], chars),
            ("px", true) => self.parse_spacing(vec!["padding-left", "padding-right"], chars),
            ("py", true) => self.parse_spacing(vec!["padding-top", "padding-bottom"], chars),
            ("pt", true) => self.parse_spacing(vec!["padding-top"], chars),
            ("pr", true) => self.parse_spacing(vec!["padding-right"], chars),
            ("pb", true) => self.parse_spacing(vec!["padding-bottom"], chars),
            ("pl", true) => self.parse_spacing(vec!["padding-left"], chars),

            ("m", true) => self.parse_spacing(vec!["margin"], chars),
            ("mx", true) => self.parse_spacing(vec!["margin-left", "margin-right"], chars),
            ("my", true) => self.parse_spacing(vec!["margin-top", "margin-bottom"], chars),
            ("mt", true) => self.parse_spacing(vec!["margin-top"], chars),
            ("mr", true) => self.parse_spacing(vec!["margin-right"], chars),
            ("mb", true) => self.parse_spacing(vec!["margin-bottom"], chars),
            ("ml", true) => self.parse_spacing(vec!["margin-left"], chars),

            // Sizing
            ("w", true) => self.parse_spacing(vec!["width"], chars),
            ("h", true) => self.parse_spacing(vec!["height"], chars),

            // Typography
            // ("text", true) => {
            // let (part, has_dash) = self.parse_util_part(chars);

            //             text-xs	font-size: 0.75rem;
            // line-height: 1rem;
            // text-sm	font-size: 0.875rem;
            // line-height: 1.25rem;
            // text-base	font-size: 1rem;
            // line-height: 1.5rem;
            // text-lg	font-size: 1.125rem;
            // line-height: 1.75rem;
            // text-xl	font-size: 1.25rem;
            // line-height: 1.75rem;
            // text-2xl	font-size: 1.5rem;
            // line-height: 2rem;
            // text-3xl	font-size: 1.875rem;
            // line-height: 2.25rem;
            // text-4xl	font-size: 2.25rem;
            // line-height: 2.5rem;
            // text-5xl	font-size: 3rem;
            // line-height: 1;
            // text-6xl	font-size: 3.75rem;
            // line-height: 1;
            // text-7xl	font-size: 4.5rem;
            // line-height: 1;
            // text-8xl	font-size: 6rem;
            // line-height: 1;
            // text-9xl	font-size: 8rem;
            // line-height: 1;

            //                 text-left	text-align: left;
            // text-center	text-align: center;
            // text-right	text-align: right;
            // text-justify
            // }
            // ("font", true) => {
            //     let (part, has_dash) = self.parse_util_part(chars);

            // font-thin	font-weight: 100;
            // font-extralight	font-weight: 200;
            // font-light	font-weight: 300;
            // font-normal	font-weight: 400;
            // font-medium	font-weight: 500;
            // font-semibold	font-weight: 600;
            // font-bold	font-weight: 700;
            // font-extrabold	font-weight: 800;
            // font-black	font-weight: 900;
            //                 font-sans	font-family: ui-sans-serif,
            // system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            // Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
            // "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
            // "Noto Color Emoji"; font-serif	font-family:
            // ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
            // font-mono	font-family: ui-monospace, SFMono-Regular, Menlo,
            // Monaco, Consolas, "Liberation Mono", "Courier New",
            // monospace;
            // }
            // ("leading", true) => {
            //     let (part, has_dash) = self.parse_util_part(chars);

            //     // leading-3	line-height: .75rem;
            //     // leading-4	line-height: 1rem;
            //     // leading-5	line-height: 1.25rem;
            //     // leading-6	line-height: 1.5rem;
            //     // leading-7	line-height: 1.75rem;
            //     // leading-8	line-height: 2rem;
            //     // leading-9	line-height: 2.25rem;
            //     // leading-10	line-height: 2.5rem;
            //     // leading-none	line-height: 1;
            //     // leading-tight	line-height: 1.25;
            //     // leading-snug	line-height: 1.375;
            //     // leading-normal	line-height: 1.5;
            //     // leading-relaxed	line-height: 1.625;
            //     // leading-loose	line-height: 2;
            // }

            // Background
            ("bg", true) => self.parse_color("background-color", chars),

            // Borders
            ("rounded", false) => String::from("border-radius:0.25rem;"),
            ("rounded", true) => {
                let (part, has_dash) = self.parse_util_part(chars);
                if has_dash {
                    panic!("NOT IMPLEMENTED")
                } else {
                    self.parse_border_radius_size(&part)
                }
            }
            // ("border", false) => String::from("border-width:1px;"),
            ("border", false) => String::from("border: 0 solid;"),
            // placement be4 size
            _ => panic!("Unsupported util {} {}", part, has_dash),
        };

        Some(css)
    }

    fn parse_util_part(&self, chars: &mut Chars) -> (String, bool) {
        let mut value = String::new();
        let mut dash = false;

        loop {
            match chars.next() {
                Some(c) => {
                    if c.is_whitespace() {
                        break;
                    } else if c == '-' {
                        dash = true;
                        break;
                    }
                    value.push(c);
                }
                None => {
                    break;
                }
            };
        }

        (value, dash)
    }

    fn parse_spacing(&self, properties: Vec<&str>, chars: &mut Chars) -> String {
        let (part, has_dash) = self.parse_util_part(chars);
        if has_dash {
            panic!("AHHH");
        }
        let spacing_value = match &*part {
            "0" => "0px",
            "px" => "1px",
            "0.5" => "0.125rem",
            "1" => "0.25rem",
            "1.5" => "0.375rem",
            "2" => "0.5rem",
            "2.5" => "0.625rem",
            "3" => "0.75rem",
            "3.5" => "0.875rem",
            "4" => "1rem",
            "5" => "1.25rem",
            "6" => "1.5rem",
            "7" => "1.75rem",
            "8" => "2rem",
            "9" => "2.25rem",
            "10" => "2.5rem",
            "11" => "2.75rem",
            "12" => "3rem",
            "14" => "3.5rem",
            "16" => "4rem",
            "20" => "5rem",
            "24" => "6rem",
            "28" => "7rem",
            "32" => "8rem",
            "36" => "9rem",
            "40" => "10rem",
            "44" => "11rem",
            "48" => "12rem",
            "52" => "13rem",
            "56" => "14rem",
            "60" => "15rem",
            "64" => "16rem",
            "72" => "18rem",
            "80" => "20rem",
            "96" => "24rem",
            _ => panic!("APA1"),
        };

        properties
            .iter()
            .map(|property| format!("{}:{};", property, spacing_value))
            .collect()
    }

    fn parse_border_radius_size(&self, part: &str) -> String {
        let value = match part {
            "none" => "0px",
            "sm" => "0.125rem",
            "md" => "0.375rem",
            "lg" => "0.5rem",
            "xl" => "0.75rem",
            "2xl" => "1rem",
            "3xl" => "1.5rem",
            "full" => "9999px",
            _ => panic!("INVALID BORDER RADIUS SIZE"),
        };

        format!("border-radius:{};", value)
    }

    fn parse_inline_display(&self, chars: &mut Chars) -> String {
        let (part, has_dash) = self.parse_util_part(chars);
        if has_dash {
            panic!("AHHH");
        }
        let value = match &*part {
            "block" => "inline-block",
            "flex" => "inline-flex",
            "grid" => "inline-grid",

            _ => panic!("INVALID INLINE DISPLAY VALUE {}", part),
        };

        format!("display:{};", value)
    }

    fn parse_color(&self, property: &str, chars: &mut Chars) -> String {
        let (part, has_dash) = self.parse_util_part(chars);

        let color = match (&*part, has_dash) {
            ("white", false) => "#fff",
            ("black", false) => "#111",
            // ("gray", true) => self.parse_gray(),
            _ => panic!("INVALID COLOR VALUE {}", part),
        };

        format!("{}:{};", property, color)
        // white #fff
        // black #111

        // Gray
        //         50
        // #FAFAFA
        // 100
        // #F5F5F5
        // 200
        // #E5E5E5
        // 300
        // #D4D4D4
        // 400
        // #A3A3A3
        // 500
        // #737373
        // 600
        // #525252
        // 700
        // #404040
        // 800
        // #262626
        // 900
        // #171717
    }
}
