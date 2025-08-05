import {
  create,
  NModal,
  NForm,
  NFormItem,
  NButton,
  NInput,
  NCard,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
  NTimePicker,
  NColorPicker
} from 'naive-ui';

const naive = create({
  components: [
    NModal,
    NForm,
    NFormItem,
    NButton,
    NInput,
    NCard,
    NMessageProvider,
    NNotificationProvider,
    NDialogProvider,
    NTimePicker,
    NColorPicker
  ]
});

export default naive;