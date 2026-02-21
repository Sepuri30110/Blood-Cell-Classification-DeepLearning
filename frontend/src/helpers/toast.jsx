import { toast } from 'react-toastify'

function errorToast(err) {
    toast.dismiss()
    toast.error(err, { autoClose: 1500, position: 'top-right' })
}

function successToast(msg) {
    toast.dismiss()
    toast.success(msg, { autoClose: 1500, position: 'top-right' })
}

function warningToast(msg) {
    toast.dismiss()
    toast.warning(msg, { autoClose: 1500, position: 'top-right' })
}

export { errorToast, successToast, warningToast };