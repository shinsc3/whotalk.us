import FORM from 'actions/ActionTypes/form';

const initialState = {
    register: {
        username: '',
        password: ''
    },
    additional: {
        firstName: '',
        lastName: '',   
    },
    login: {
        username: '',
        password: ''
    },
    error: {
        register: {
            username: false,
            password: false
        }
    }
}

function form(state=initialState, action) {
    const payload = action.payload;
    switch(action.type) {
        case FORM.CHANGE_INPUT:
            return {
                ...state,
                [payload.form]: {
                    ...state[payload.form],
                    [payload.name]: payload.value
                }
            };
        case FORM.SET_INPUT_ERROR: 
            const err = {};
            err[payload.form] = {...state.error[payload.form]};
            err[payload.form][payload.name] = payload.error
            return {
                ...state,
                error: {
                    ...state.error,
                    ...err
                }
            }
        case FORM.FORM_RESET: 
            return initialState;
        default:
            return state;
    }
}

export default form;