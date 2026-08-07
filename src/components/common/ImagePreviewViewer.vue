<template>
  <el-image-viewer
    v-if="modelValue && url"
    :key="url"
    :url-list="[url]"
    :initial-index="0"
    :infinite="false"
    :hide-on-click-modal="false"
    teleported
    @close="handleClose"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  url: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
