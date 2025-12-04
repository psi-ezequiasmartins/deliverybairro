// SweetAlert2.js
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function showSuccess(message, callback) {
  MySwal.fire({
    icon: 'success',
    title: 'Sucesso',
    text: message,
    confirmButtonText: 'OK',
  }).then(() => {
    if (callback) callback();
  });
}

export function showError(message) {
  MySwal.fire({
    icon: 'error',
    title: 'Erro',
    text: message,
    confirmButtonText: 'OK',
  });
}

export function showInfo(message) {
  MySwal.fire({
    icon: 'info',
    title: 'Informação',
    text: message,
    confirmButtonText: 'OK',
  });
}
