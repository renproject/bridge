import { createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';

export default createMuiTheme({
    typography: {
        fontFamily: [
            // 'Roboto Mono',
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
            light: '#000',
            main: '#000',
            dark: '#000',
            contrastText: '#fff',
        },
        // primary: blueGrey,
        secondary: grey,
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'none',
                '&.MuiButton-outlined': {
                    // border: '1px solid #eee',
                    '&.Mui-disabled': {
                      // backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                        border: '1px solid transparent'
                    }
                },
                borderRadius: 0
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
            backgroundColor: 'transparent',
            '& span': {
              fontSize: 14
            },
            '& button': {
              minHeight: 54
            },
            borderRadius: 0
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
                backgroundColor: 'transparent !important',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                },
                '& .MuiToggleButton-label': {
                    fontSize: 12
                }
            }
        }
    }
});
