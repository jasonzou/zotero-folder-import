// @ts-nocheck
// This file is used by the duplicates XUL dialog

let ui = {
  list: null,
  count: null,
}

let duplicates = []

function onLoad() {
  ui.list = document.getElementById('duplicates-list')
  ui.count = document.getElementById('duplicate-count')

  duplicates = window.arguments[0].duplicates

  for (const dup of duplicates) {
    const option = ui.list.appendChild(document.createElement('option'))
    option.textContent = `${dup.file} - ${dup.message}`
    option.setAttribute('value', dup.file)
    option.setAttribute('selected', 'selected')
  }

  const skipped = duplicates.length
  ui.count.value = `${skipped} duplicate file${skipped > 1 ? 's' : ''} will be skipped`

  document.getElementsByTagName('button')[0].label = 'Continue with Selected'
}

function onCancel() {
  return true
}

function onAccept() {
  const skippedFiles = new Set()
  for (const option of ui.list.options) {
    if (option.selected) {
      skippedFiles.add(option.value)
    }
  }

  window.arguments[0].skippedFiles = skippedFiles

  for (const dup of duplicates) {
    if (skippedFiles.has(dup.file)) {
      log.info(`Will skip duplicate: ${dup.file}`)
    }
  }

  return true
}
