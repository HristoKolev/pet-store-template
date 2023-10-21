import {
  resetForm,
  enableFormInputs,
  formElements,
  lockForm,
  fillFormInputs,
  showForm,
  hideForm,
  disableFormInputs,
} from './form.js';

import { getPet, deletePet } from './api.js';
import { petKindsMap, refreshPets } from './app.js';
import {
  createSubmitSpinner,
  formatDate,
  showError,
  hideError,
} from './utils.js';

// Pet modal
export const petModalElements = {
  modal: document.getElementById('pet-modal'),
  title: document.getElementById('pet-modal-title'),
  titleCloseButton: document.getElementById('pet-modal-close'),
  loadingSpinner: document.getElementById('pet-modal-spinner'),
};

export function setPetModalHeaderText(textContent) {
  petModalElements.title.textContent = textContent;
}

export function hidePetModal() {
  petModalElements.modal.style.display = 'none';
  hideError('fetch-pet-error');
  hideError('submit-form-error');
}

export function showPetModal() {
  petModalElements.modal.style.display = 'block';
}

export async function configureEditPetModal(petId) {
  hideForm();
  resetForm();

  setPetModalHeaderText(`View pet #${petId}`);
  disablePetModalEvents();
  disableFormInputs();
  showPetModalSpinner();
  showPetModal();

  try {
    const pet = await getPet(petId);

    fillFormInputs(pet);
    lockForm(pet);
    showForm();
  } catch (err) {
    console.error(err);
    showError('fetch-pet-error');
  } finally {
    hidePetModalSpinner();
    enablePetModalEvents();
  }
}

export function configureNewPetModal() {
  resetForm();
  enableFormInputs(true);
  setPetModalHeaderText('Add pet');

  formElements.saveButton.style.display = 'flex';
  formElements.editButton.style.display = 'none';

  formElements.deleteButton.style.display = 'none';
  formElements.lockButton.style.display = 'none';

  formElements.addedDate.valueAsDate = new Date();
  formElements.form.dataset.isLocked = 'false';

  showForm();
  showPetModal();
}

export function showPetModalSpinner() {
  petModalElements.loadingSpinner.style.display = 'flex';
}

export function hidePetModalSpinner() {
  petModalElements.loadingSpinner.style.display = 'none';
}

petModalElements.titleCloseButton.addEventListener('click', () => {
  hidePetModal();
});

export function disablePetModalEvents() {
  disableModalsBackdropClosing();

  petModalElements.titleCloseButton.disabled = true;
  formElements.saveButton.disabled = true;
  formElements.deleteButton.disabled = true;
  formElements.cancelButton.disabled = true;
  formElements.lockButton.disabled = true;
}

export function enablePetModalEvents() {
  enableModalsBackdropClosing();

  petModalElements.titleCloseButton.disabled = false;
  formElements.saveButton.disabled = false;
  formElements.deleteButton.disabled = false;
  formElements.cancelButton.disabled = false;
  formElements.lockButton.disabled = false;
}

// Delete modal
const deleteModalElements = {
  modal: document.getElementById('delete-modal'),
  title: document.getElementById('delete-modal-title'),
  titleCloseButton: document.getElementById('delete-modal-close'),
  petInfo: document.getElementById('delete-modal-pet-info'),
  deleteButton: document.getElementById('delete-modal-delete-btn'),
  cancelButton: document.getElementById('delete-modal-cancel-btn'),
};

export async function showDeleteModal(pet) {
  deleteModalElements.title.textContent = `Delete pet #${pet.petId}`;
  deleteModalElements.petInfo.innerHTML = '';

  function createPetInfoElement(textContent) {
    const div = document.createElement('div');
    div.textContent = textContent;

    return div;
  }

  deleteModalElements.petInfo.appendChild(
    createPetInfoElement(`Name: ${pet.petName}`)
  );
  deleteModalElements.petInfo.appendChild(
    createPetInfoElement(`Kind: ${petKindsMap.get(pet.kind)}`)
  );
  if (pet.hasOwnProperty('age')) {
    deleteModalElements.petInfo.appendChild(
      createPetInfoElement(`Age: ${pet.age}`)
    );
  }
  if (pet.hasOwnProperty('notes')) {
    deleteModalElements.petInfo.appendChild(
      createPetInfoElement(`Notes: ${pet.notes ? pet.notes : ''}`)
    );
  }
  if (pet.hasOwnProperty('healthProblems')) {
    deleteModalElements.petInfo.appendChild(
      createPetInfoElement(
        `Has health problems: ${pet.healthProblems ? 'yes' : 'no'}`
      )
    );
  }
  deleteModalElements.petInfo.appendChild(
    createPetInfoElement(`Date added: ${formatDate(new Date(pet.addedDate))}`)
  );

  deleteModalElements.modal.style.display = 'block';

  deleteModalElements.deleteButton.onclick = async function () {
    showDeleteModalSubmitSpinner();
    disableDeleteModalEvents();

    try {
      await deletePet(pet.petId);
      hideDeleteModal();
      hidePetModal();
      void refreshPets();
    } catch (err) {
      console.error(err);
      showError('delete-pet-error');
    } finally {
      hideDeleteModalSubmitSpinner();
      enableDeleteModalEvents();
    }
  };
}

export function hideDeleteModal() {
  deleteModalElements.modal.style.display = 'none';
  hideError('delete-pet-error');
}

function showDeleteModalSubmitSpinner() {
  deleteModalElements.deleteButton.appendChild(
    createSubmitSpinner('delete-modal-submit-spinner')
  );
}

function hideDeleteModalSubmitSpinner() {
  document.getElementById('delete-modal-submit-spinner').remove();
}

deleteModalElements.titleCloseButton.addEventListener('click', () => {
  hideDeleteModal();
});

deleteModalElements.cancelButton.addEventListener('click', () => {
  hideDeleteModal();
});

export function enableDeleteModalEvents() {
  enableModalsBackdropClosing();
  deleteModalElements.titleCloseButton.disabled = false;
  deleteModalElements.cancelButton.disabled = false;
  deleteModalElements.deleteButton.disabled = false;
}

export function disableDeleteModalEvents() {
  disableModalsBackdropClosing();
  deleteModalElements.titleCloseButton.disabled = true;
  deleteModalElements.cancelButton.disabled = true;
  deleteModalElements.deleteButton.disabled = true;
}

// Common
function closeModalsOnBackdropClick(e) {
  if (e.target === petModalElements.modal) {
    petModalElements.modal.style.display = 'none';
  } else if (e.target === deleteModalElements.modal) {
    deleteModalElements.modal.style.display = 'none';
  }
}

export function disableModalsBackdropClosing() {
  document.removeEventListener('click', closeModalsOnBackdropClick);
}

export function enableModalsBackdropClosing() {
  document.addEventListener('click', closeModalsOnBackdropClick);
}
