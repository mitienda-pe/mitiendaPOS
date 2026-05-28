import { ref } from 'vue';

const toast = ref({
  show: false,
  type: 'info',
  message: ''
});

let hideTimeout = null;

export function useToast() {
  const showToast = (type, message, duration = 3000) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    toast.value = { show: true, type, message };

    hideTimeout = setTimeout(() => {
      toast.value.show = false;
      hideTimeout = null;
    }, duration);
  };

  const hideToast = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    toast.value.show = false;
  };

  return { toast, showToast, hideToast };
}
