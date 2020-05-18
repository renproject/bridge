import React from 'react';
import theme from '../theme/theme'
import classNames from 'classnames'
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

const styles = () => ({
    link: {
        fontSize: 12,
        textDecoration: 'underline',
        cursor: 'pointer',
        color: '#006FE8',
        '&:hover': {
            color: '#006FE8'
        }
    }
})

const ActionLink = function(props) {
    const {
        children,
        classes,
        className
    } = props

    return <a className={classNames(classes.link, className)} {...props}>{children}</a>
}

export default withStyles(styles)(ActionLink);
