import {
  configureNewPetModal,
  configureEditPetModal,
  showDeleteModal,
} from './modals.js';
import { getPetKinds, getAllPets } from './api.js';
import { formatDate, hideError, showError } from './utils.js';
import { formElements } from './form.js';

const mainPageElements = {
  addPetButton: document.getElementById('add-pet-btn'),
  loadingPetsSpinner: document.getElementById('loading-pets-spinner'),
  tableBody: document.getElementById('data-table').tBodies[0],
};

export const petKindsMap = new Map();
const allPetsMap = new Map();

window.addEventListener('DOMContentLoaded', async () => {
  await refreshPets(true);
});

export async function refreshPets(fetchPetKinds = false) {
  hideError('main-page-error');
  showLoadingPetsSpinner();
  mainPageElements.tableBody.innerHTML = '';

  try {
    const allPetsPromise = getAllPets();

    if (fetchPetKinds) {
      const petKinds = await getPetKinds();
      for (let kind of petKinds) {
        petKindsMap.set(kind.value, kind.displayName);

        const petKindOption = document.createElement('option');
        petKindOption.innerText = kind.displayName;
        petKindOption.value = kind.value;
        formElements.kind.append(petKindOption);
      }

      mainPageElements.addPetButton.disabled = false;
    }

    allPetsMap.clear();
    const pets = await allPetsPromise;
    for (let pet of pets.sort((a, b) => b.petId - a.petId)) {
      const tr = document.createElement('tr');
      tr.appendChild(createTableColumn(pet.petId));
      tr.appendChild(createTableColumn(pet.petName));
      tr.appendChild(createTableColumn(formatDate(new Date(pet.addedDate))));
      tr.appendChild(createTableColumn(petKindsMap.get(pet.kind)));
      tr.appendChild(createPetTableButtons(pet.petId));

      mainPageElements.tableBody.appendChild(tr);
      allPetsMap.set(pet.petId, pet);
    }
  } catch (err) {
    console.error(err);
    showError('main-page-error');
  } finally {
    hideLoadingPetsSpinner();
  }
}

function createTableColumn(textContent) {
  const td = document.createElement('td');
  td.textContent = textContent;
  return td;
}

function createPetTableButtons(petId) {
  const td = document.createElement('td');
  td.setAttribute('colspan', '2');

  const flexWrapperDiv = document.createElement('div');
  flexWrapperDiv.appendChild(createViewEditButton(petId));
  flexWrapperDiv.appendChild(createDeleteButton(petId));

  td.appendChild(flexWrapperDiv);
  return td;
}

function createViewEditButton(petId) {
  const viewEditButton = document.createElement('button');
  viewEditButton.textContent = 'View / Edit';
  viewEditButton.classList.add('btn', 'btn-warning');
  viewEditButton.dataset.petId = petId;
  viewEditButton.dataset.type = 'edit';

  return viewEditButton;
}

function createDeleteButton(petId) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.dataset.petId = petId;
  deleteButton.dataset.type = 'delete';

  return deleteButton;
}

mainPageElements.tableBody.addEventListener('click', async (e) => {
  if (e.target.tagName !== 'BUTTON') {
    return;
  }

  const dataSet = e.target.dataset;
  const petId = Number(dataSet.petId);

  const buttonType = dataSet.type;
  if (buttonType === 'edit') {
    await configureEditPetModal(petId);
  } else if (buttonType === 'delete') {
    await showDeleteModal(allPetsMap.get(petId));
  }
});

mainPageElements.addPetButton.addEventListener('click', () => {
  configureNewPetModal();
});

function showLoadingPetsSpinner() {
  mainPageElements.loadingPetsSpinner.style.display = 'flex';
}

function hideLoadingPetsSpinner() {
  mainPageElements.loadingPetsSpinner.style.display = 'none';
}
