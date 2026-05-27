import { createTheme } from "@mui/material";
 
export const getAppTheme = () => {
 
    const theme = createTheme({
        palette: {
            mode: "light",
            common: {
                black: '#000000',
                white: '#ffffff'
            },
            primary: {
                main: '#0FAFAF',
                light: '#3fbfbf',
                dark: '#0F7B81',
                contrastText: '#ffffff'
            },
            secondary: {
                main: '#F0F3F6',
                light: '#D1D3D4',
                dark: '#EBEBEB',
                contrastText: '#A7A9AC'
            },
            error: {
                main: '#FF0000'
            },
            text: {
                primary: "#000000",
                secondary: "#58595B",
                disabled: "#AFAFAF",
            },
            background: {
                heading: "#ffffff",
                default: "#ffffff",
                paper: "#ffffff"
            },
            action: {
                hover: '#00747B',
                active: '#0D8B92'
            },
            typography: {
            },
            shape: {
                borderRadius: 4
            }
        },
        typography: {
            fontFamily: 'Calibri',
            fontSize: 14,
        },
        table: {
            header: {
              alignment: "center"
            },
            columns: {
              alignment: {
                integer: "right",
                string: "left",
                amount: "right",
                date: "right",
                dateTime: "right"
              }
            }
          },
 
    } as any);
 
    return {
        theme,
    };
}

