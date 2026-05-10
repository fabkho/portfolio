<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue'

type ModalType = 'dialog' | 'alertdialog' | null

const containerRef = ref<HTMLElement>()
const modalRef = ref<HTMLElement>()
const dialogTriggerRef = ref<HTMLButtonElement>()
const alertTriggerRef = ref<HTMLButtonElement>()

const modalType = ref<ModalType>(null)
const isOpen = computed(() => modalType.value !== null)
const currentRole = computed(() => modalType.value ?? 'dialog')

const headingId = 'modal-demo-heading'
const descriptionId = 'modal-demo-description'

const ariaLabelledby = computed(() => headingId)
const ariaDescribedby = computed(() =>
  modalType.value === 'alertdialog' ? descriptionId : undefined
)

const focusEvents = reactive<string[]>([])
let triggerRef: HTMLButtonElement | undefined

function log(msg: string) {
  focusEvents.push(msg)
  if (focusEvents.length > 6) focusEvents.shift()
}

function labelFor(el: Element): string {
  if (el instanceof HTMLInputElement) {
    const label = el.closest('.modal-body')?.querySelector(`label[for="${el.id}"]`)
    return label ? `"${label.textContent}" input` : `input`
  }
  if (el instanceof HTMLButtonElement) return `"${el.textContent?.trim()}" button`
  return el.tagName.toLowerCase()
}

function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) return []
  return Array.from(
    modalRef.value.querySelectorAll<HTMLElement>(
      'input, button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
    )
  )
}

function resolveInitialFocus(): HTMLElement | null {
  if (!modalRef.value) return null
  const autofocus = modalRef.value.querySelector<HTMLElement>('[data-autofocus]')
  if (autofocus) return autofocus
  const heading = modalRef.value.querySelector<HTMLElement>('h1,h2,h3,h4,h5,h6')
  if (heading) {
    heading.tabIndex = -1
    return heading
  }
  return modalRef.value
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    log(`Escape pressed → modal closed → focus returned to "${triggerRef?.textContent?.trim()}"`)
    close()
    return
  }

  if (e.key === 'Tab') {
    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
        log(`Shift+Tab pressed → focus moved to ${labelFor(last)}`)
      } else {
        const target = focusable[focusable.indexOf(document.activeElement as HTMLElement) - 1]
        if (target) log(`Shift+Tab pressed → focus moved to ${labelFor(target)}`)
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
        log(`Tab pressed → focus moved to ${labelFor(first)}`)
      } else {
        const target = focusable[focusable.indexOf(document.activeElement as HTMLElement) + 1]
        if (target) log(`Tab pressed → focus moved to ${labelFor(target)}`)
      }
    }
  }
}

async function openModal(type: ModalType, trigger: HTMLButtonElement | undefined) {
  triggerRef = trigger
  modalType.value = type
  await nextTick()

  const target = resolveInitialFocus()
  if (target) {
    target.focus()
    log(`Modal opened → focus moved to ${labelFor(target)}`)
  }
}

function openDialog() {
  openModal('dialog', dialogTriggerRef.value)
}

function openAlertDialog() {
  openModal('alertdialog', alertTriggerRef.value)
}

function close() {
  modalType.value = null
  nextTick(() => triggerRef?.focus())
}

function handleSave() {
  log(`Save clicked → modal closed → focus returned to "${triggerRef?.textContent?.trim()}"`)
  close()
}

function handleDelete() {
  log(`Delete clicked → modal closed → focus returned to "${triggerRef?.textContent?.trim()}"`)
  close()
}

function handleCancel() {
  log(`Cancel clicked → modal closed → focus returned to "${triggerRef?.textContent?.trim()}"`)
  close()
}
</script>

<template>
  <DemoWrapper
    label="Modal Focus Management"
    tag="INTERACTIVE"
    description="Open the modal and observe how focus is trapped, placed, and returned."
  >
    <div
      ref="containerRef"
      class="modal-demo"
    >
      <div class="triggers">
        <button
          ref="dialogTriggerRef"
          class="trigger-btn"
          @click="openDialog"
        >
          Open Dialog
        </button>
        <button
          ref="alertTriggerRef"
          class="trigger-btn"
          @click="openAlertDialog"
        >
          Open Alert Dialog
        </button>
      </div>

      <div class="modal-area">
        <Transition name="modal">
          <div
            v-if="isOpen"
            class="modal-backdrop"
            @mousedown.self="close"
          >
            <div
              ref="modalRef"
              :role="currentRole"
              aria-modal="true"
              :aria-labelledby="ariaLabelledby"
              :aria-describedby="ariaDescribedby"
              class="modal-container"
              @keydown="onKeydown"
            >
              <!-- Dialog content -->
              <template v-if="modalType === 'dialog'">
                <h3
                  :id="headingId"
                  class="modal-heading"
                >
                  Edit Profile
                </h3>
                <div class="modal-body">
                  <div class="field">
                    <label for="modal-name">Name</label>
                    <input
                      id="modal-name"
                      data-autofocus
                      type="text"
                      placeholder="Your name"
                    >
                  </div>
                  <div class="field">
                    <label for="modal-email">Email</label>
                    <input
                      id="modal-email"
                      type="email"
                      placeholder="you@example.com"
                    >
                  </div>
                </div>
                <div class="modal-actions">
                  <button
                    class="btn btn--primary"
                    @click="handleSave"
                  >
                    Save
                  </button>
                  <button
                    class="btn btn--secondary"
                    @click="handleCancel"
                  >
                    Cancel
                  </button>
                </div>
              </template>

              <!-- Alert Dialog content -->
              <template v-if="modalType === 'alertdialog'">
                <h3
                  :id="headingId"
                  class="modal-heading"
                >
                  Delete Account?
                </h3>
                <p
                  :id="descriptionId"
                  data-description
                  class="modal-description"
                >
                  This action is permanent and cannot be undone.
                </p>
                <div class="modal-actions">
                  <button
                    class="btn btn--danger"
                    @click="handleDelete"
                  >
                    Delete
                  </button>
                  <button
                    class="btn btn--secondary"
                    data-autofocus
                    @click="handleCancel"
                  >
                    Cancel
                  </button>
                </div>
              </template>
            </div>
          </div>
        </Transition>

        <div
          v-if="!isOpen"
          class="modal-placeholder"
        >
          <span class="modal-placeholder__text">Modal appears here</span>
        </div>
      </div>

      <div
        class="focus-log"
        aria-live="polite"
      >
        <div class="focus-log__label">
          Focus log
        </div>
        <div class="focus-log__entries">
          <div
            v-for="(event, i) in focusEvents"
            :key="i"
            class="focus-log__entry"
          >
            {{ event }}
          </div>
          <div
            v-if="focusEvents.length === 0"
            class="focus-log__entry focus-log__entry--empty"
          >
            Interact with the modal to see focus events
          </div>
        </div>
      </div>
    </div>

    <KeyboardVisualizer :target="containerRef" />
    <AriaInspector
      :target="modalRef"
      :attrs="['role', 'aria-modal', 'aria-labelledby', 'aria-describedby']"
    />
  </DemoWrapper>
</template>

<style scoped>
.modal-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.triggers {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.trigger-btn {
  padding: 0.5rem 1rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent);
  background: transparent;
  border: 1.5px solid var(--color-accent);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.trigger-btn:hover {
  background: var(--color-accent);
  color: var(--color-bg);
}

.trigger-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Modal area */
.modal-area {
  position: relative;
  min-height: 220px;
  border-radius: 8px;
  overflow: hidden;
}

.modal-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  border: 1.5px dashed var(--color-ink-faint);
  border-radius: 8px;
}

.modal-placeholder__text {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-faint);
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  z-index: 1;
}

.modal-container {
  width: 90%;
  max-width: 360px;
  background: var(--color-bg);
  border: 1.5px solid var(--color-ink-faint);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.modal-heading {
  margin: 0 0 0.75rem;
  font-family: var(--font-sans);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-ink);
}

.modal-description {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-ink-muted);
}

.field input {
  padding: 0.45rem 0.6rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--color-ink);
  background: var(--color-bg);
  border: 1.5px solid var(--color-ink-faint);
  border-radius: 5px;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus-visible {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(var(--color-accent), 0.15);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.4rem 0.85rem;
  font-family: var(--font-sans);
  font-size: 0.825rem;
  font-weight: 500;
  border: 1.5px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn--primary {
  background: var(--color-accent);
  color: var(--color-bg);
}

.btn--primary:hover {
  opacity: 0.9;
}

.btn--secondary {
  background: transparent;
  color: var(--color-ink-muted);
  border-color: var(--color-ink-faint);
}

.btn--secondary:hover {
  border-color: var(--color-ink-muted);
  color: var(--color-ink);
}

.btn--danger {
  background: #e54d42;
  color: #fff;
  border-color: #e54d42;
}

.btn--danger:hover {
  background: #d03a30;
}

/* Focus log */
.focus-log {
  border: 1.5px solid var(--color-ink-faint);
  border-radius: 6px;
  overflow: hidden;
}

.focus-log__label {
  padding: 0.35rem 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1.5px solid var(--color-ink-faint);
}

.focus-log__entries {
  max-height: 9.5rem;
  overflow-y: auto;
  padding: 0.35rem 0;
}

.focus-log__entry {
  padding: 0.2rem 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.focus-log__entry--empty {
  color: var(--color-ink-faint);
  font-style: italic;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
