import React from "react";
import Swal from 'sweetalert2';

const Products = () => {
  const showAlert = () => {
    Swal.fire({
      title: 'محصول به سبد خرید اضافه شد!',
      text: 'آیا می‌خواهید ادامه دهید؟',
      icon: 'success',
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
      showCancelButton: true,
    });
  };

  return (
    <button onClick={showAlert}>
      افزودن به سبد خرید
    </button>
  );
};
export default Products;