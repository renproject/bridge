import { createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';

export default createMuiTheme({
    typography: {
        fontFamily: [
            // 'Roboto Mono',
            "Suisse Intl",
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(',')
    },
    palette: {
        type: 'light',
        primary: {
            light: '#649dff',
            main: '#006fe8',
            dark: '#0045b5',
            contrastText: '#fff',
        },
        // primary: blueGrey,
        secondary: grey,
        divider: '#DBE0E8'
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'none',
                borderRadius: 4,
                '&.MuiButton-outlined': {
                    border: '1px solid #DCE0E3',
                    '&.Mui-disabled': {
                      // backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                        border: '1px solid transparent'
                    }
                },
                '&.MuiButton-sizeLarge': {
                    minHeight: 54,
                    fontSize: 14,
                },
            }
        },
        PrivateNotchedOutline: {
            root: {
            }
        },
        // '.MuiOutlinedInput-root:hover':{
        //     borderColor: '#EBEBEB !important'
        // },
        MuiOutlinedInput: {
            root:{
              fontSize: 14,
              '& .MuiInputAdornment-marginDense span': {
                fontSize: 12
              },
              '& fieldset': {
                borderRadius: 0
              }
            },
            notchedOutline: {
                // borderColor: 'rgba(255, 255, 255, 0.23) !important',
                borderWidth: '1px !important'
            },
            inputMarginDense: {
              fontSize: 12,
              paddingTop: 11.5,
              paddingBottom: 11.5,
            }
        },
        MuiTextField: {

        },
        MuiToggleButtonGroup: {
          root: {
            backgroundColor: '#fff',
            '& span': {
              fontSize: 14
            },
            '& button': {
              minHeight: 54
            },
            borderRadius: 0,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          },
          grouped: {
            '&:not(:first-child)': {
              // borderLeft: '1px solid rgba(255, 255, 255, 0.23)'
            }
          }
        },
        MuiTableCell: {
            root: {
                // borderBottom: '0.5px solid rgba(255, 255, 255, 0.12)',
            }
        },
        // .MuiToggleButtonGroup-grouped:not(:first-child)
        MuiToggleButton: {
            root: {
                // border: '1px solid rgba(255, 255, 255, 0.23)',
                backgroundColor: '#eeeeee2e !important',
                '& img': {
                  opacity: 0.75
                },
                // backgroundColor: '#fff',
                '&.Mui-selected': {
                    // back
                    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                    color: '#000',
                    fontWeight: '500',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                    },
                    '& img': {
                      opacity: 1
                    }
                },
                borderRadius: 0,
                '&:hover': {
                    backgroundColor: '#eeeeee2e !important',
                },
                '& .MuiToggleButton-label': {
                    fontSize: 12
                },
            }
        }
    }
});
