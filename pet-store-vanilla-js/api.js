const apiBaseUrl = 'http://localhost:5150';
const apiWaitTimeout = 5000;

export function getPet(petId) {
  return fetchFromApi(`/pet/${petId}`, 'GET');
}

export function addPet(pet) {
  return fetchFromApi('/pet', 'POST', JSON.stringify(pet));
}

export function editPet(pet) {
  return fetchFromApi(`/pet/${pet.petId}`, 'PUT', JSON.stringify(pet));
}

export function deletePet(petId) {
  return fetchFromApi(`/pet/${petId}`, 'DELETE');
}

export function getAllPets() {
  return fetchFromApi('/pet/all', 'GET');
}

export function getPetKinds() {
  return fetchFromApi('/pet/kinds', 'GET');
}

async function fetchFromApi(endPoint, method, body) {
  const apiErrorInfo = `endpoint: ${endPoint} | method: ${method}`;

  const headers = {};
  if (method !== 'GET') {
    headers['Content-type'] = 'application/json';
  }

  let apiResponse;
  try {
    apiResponse = await fetch(`${apiBaseUrl}${endPoint}`, {
      method: method,
      headers: headers,
      body: body,
      signal: AbortSignal.timeout(apiWaitTimeout),
    });
  } catch (err) {
    console.error(err);
    throw new Error(`Fetch error. ${apiErrorInfo}`);
  }

  if (!apiResponse.ok) {
    throw new Error(
      `Received non successful status code: ${apiResponse.status}. ${apiErrorInfo}`
    );
  }

  try {
    return apiResponse.json();
  } catch (err) {
    console.error(err);
    throw new Error(`Error parsing JSON response. ${apiErrorInfo}`);
  }
}
