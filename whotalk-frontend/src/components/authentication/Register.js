import React, {Component} from 'react';
import {Link, Redirect} from 'react-router';
import {RegisterForm} from './forms';
import autobind from 'autobind-decorator'
import notify from 'helpers/notify';

const toastr = window.toastr;

class Register extends Component {

    constructor(props) {
        super(props);
        this.state = {
            animate: false,
            leave: false,
            path: ''
        };
    }

    @autobind
    leaveTo({
        path,
        express = false
    }) {
        this.setState({animate: true, path});

        if (express) {
            if (process.env.NODE_ENV === 'development') {
                document.location.href = "http://localhost:4000" + path;
            } else {
                document.location.href = path;
            }
            return;
        }
        setTimeout(() => this.setState({leave: true}), 700)
    }

    @autobind
    async handleSubmit() {
        const {form, status, AuthActions, FormActions} = this.props;
        const {username, password} = form;

        notify.clear();

        AuthActions.setSubmitStatus({name: 'register', value: true});

        // do username / password regex check
        const regex = {
            username: /^[0-9a-z_]{4,20}$/,
            password: /^.{5,30}$/
        }

        let error = false;

        if (!regex.password.test(password)) {
            error = true;
            notify({type: 'error', message: 'Password should be 5~30 characters.'});
            // toastr.error('<b><i>Password</i></b> should be 5 ~ 30 alphanumeric
            // characters.');
            FormActions.setInputError({form: 'register', name: 'password', error: true});
        } else {
            FormActions.setInputError({form: 'register', name: 'password', error: false});
        }

        if (!regex.username.test(username)) {
            error = true;
            notify({type: 'error', message: 'Username should be 4~20 alphanumeric characters or an underscore'});
            // toastr.error('<b><i>Username</i></b> should be 4 ~ 20 alphanumeric characters
            // or an underscore (_)');
            FormActions.setInputError({form: 'register', name: 'username', error: true});
        } else {
            FormActions.setInputError({form: 'register', name: 'username', error: false});
        }

        if (!error) {
            try {
                const result = await AuthActions.checkUsername(form.username);
                if (this.props.status.usernameExists) {
                    FormActions.setInputError({form: 'register', name: 'username', error: true});
                    // toastr.error('That username is already taken, please try another one.');
                    notify({type: 'error', message: 'That username is already taken, please try another one.'});
                    error = true;
                } else {
                    FormActions.setInputError({form: 'register', name: 'username', error: false});
                }
            } catch (e) {
                notify({type: 'error', message: 'Oops!'});
            }
        }

        AuthActions.setSubmitStatus({name: 'register', value: false});

        // stop at here if there is an error
        if (error) {
            return;
        }

        AuthActions.localRegisterPrior({username, password});
        this.leaveTo({path: '/auth/register/additional'});

    }

    @autobind
    handleChange(e) {
        const {FormActions} = this.props;
        FormActions.changeInput({form: 'register', name: e.target.name, value: e.target.value})
    }

    @autobind
    async handleBlur(e) {
        const {form, AuthActions} = this.props;

        if (e.target.name === 'username') {
            // on username blur, do check username
            const result = await AuthActions.checkUsername(form.username);
            if (this.props.status.usernameExists) {
                // toastr.error('That username is already taken, please try another one.',
                // 'ERROR');
                notify({type: 'error', message: 'That username is already taken, please try another one.'});
            }
        }
    }

    @autobind
    handleKeyPress(e) {
        if (e.charCode === 13) {
            this.handleSubmit();
        }
    }

    componentWillUnmount() {
        this
            .props
            .FormActions
            .formReset();
        this
            .props
            .AuthActions
            .resetRegisterStatus();
    }

    render() {
        const redirect = (<Redirect
            to={{
            pathname: this.state.path,
            state: {
                from: this.props.location
            }
        }}/>);

        const {handleChange, handleSubmit, handleBlur, handleKeyPress, leaveTo} = this;
        const {form, formError, status} = this.props;

        return (
            <div className="register">
                <div
                    className={"box bounceInRight " + (this.state.animate
                    ? 'bounceOutLeft'
                    : '')}>
                    <div className="social">
                        <h2>SIGN UP WITH</h2>
                        <div className="ui grid">
                            <div className="eight wide column">
                                <button
                                    onClick={() => leaveTo({path: '/api/authentication/facebook', express: true})}
                                    className="ui facebook button massive hide-on-mobile">
                                    <i className="facebook icon"></i>
                                    Facebook
                                </button>
                                <button
                                    onClick={() => leaveTo({path: '/api/authentication/facebook', express: true})}
                                    className="ui facebook button icon massive hide-on-desktop">
                                    <i className="facebook icon"></i>
                                </button>
                            </div>
                            <div className="eight wide column">
                                <button onClick={()=>leaveTo({path: '/api/authentication/google', express: true})}
                                className="ui google plus button massive hide-on-mobile">
                                    <i className="google icon"></i>
                                    Google
                                </button>
                                <button onClick={()=>leaveTo({path: '/api/authentication/google', express: true})}
                                className="ui google plus icon button massive hide-on-desktop">
                                    <i className="google icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="divider">
                        OR
                    </div>
                    <div className="local">
                        <h2>SIGN UP WITH YOUR USERNAME</h2>
                        <RegisterForm
                            username={form.username}
                            password={form.password}
                            status={status}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onSubmit={handleSubmit}
                            error={formError}
                            onKeyPress={handleKeyPress}/>
                        <div className="side-message">Already have an account?&nbsp;
                            <a onClick={() => this.leaveTo({pathname: "/auth"})}>Log In</a>
                        </div>
                    </div>
                </div>
                {this.state.leave
                    ? redirect
                    : undefined}
            </div>
        );
    }
}

export default Register;