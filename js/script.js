
 let currentPage = 1;
 let currentFilters = {
     name: '',
     gender: '',
     species: '',
     status: ''
 };
 let allCharacters = [];
 let filteredCharacters = [];

 const API_BASE = 'https://rickandmortyapi.com/api/character';

 // DOM Elements
 const nameFilter = document.getElementById('nameFilter');
 const genderFilter = document.getElementById('genderFilter');
 const speciesFilter = document.getElementById('speciesFilter');
 const statusFilter = document.getElementById('statusFilter');
 const charactersGrid = document.querySelector('.characters-grid');
 const prevButton = document.querySelector('.pagination__button--prev');
 const nextButton = document.querySelector('.pagination__button--next');

 document.addEventListener('DOMContentLoaded', function() {
     initializeApp();
     setupEventListeners();
 });

 async function initializeApp() {
     showLoading();
     try {
         await loadAllCharacters();
         applyFiltersAndRender();
     } catch (error) {
         console.error('Error initializing app:', error);
         showError('Error al cargar los personajes. Por favor, recarga la página.');
     }
 }

 function setupEventListeners() {
     nameFilter.addEventListener('input', debounce(handleFilterChange, 300));
     genderFilter.addEventListener('change', handleFilterChange);
     speciesFilter.addEventListener('change', handleFilterChange);
     statusFilter.addEventListener('change', handleFilterChange);
     
     // Paginación
     prevButton.addEventListener('click', () => changePage(-1));
     nextButton.addEventListener('click', () => changePage(1));
 }

 async function loadAllCharacters() {
     try {
         let allData = [];
         let page = 1;
         let hasNextPage = true;
         
         while (hasNextPage) {
             const response = await fetch(`${API_BASE}?page=${page}`);
             const data = await response.json();
             
             if (data.results) {
                 allData = [...allData, ...data.results];
                 hasNextPage = data.info.next !== null;
                 page++;
             } else {
                 hasNextPage = false;
             }
         }
         
         allCharacters = allData;
         
         // Llenar opciones de filtros de manera dinámica
         populateFilterOptions();
         
     } catch (error) {
         console.error('Error loading characters:', error);
         throw error;
     }
 }

 function populateFilterOptions() {
     const uniqueSpecies = [...new Set(allCharacters.map(char => char.species))]
         .filter(species => species)
         .sort();
     
     // Limpiar opciones existentes (excepto la primera)
     speciesFilter.innerHTML = '<option value="">Especie</option>';
     uniqueSpecies.forEach(species => {
         const option = document.createElement('option');
         option.value = species;
         option.textContent = species;
         speciesFilter.appendChild(option);
     });
 }

 function handleFilterChange() {
     currentFilters = {
         name: nameFilter.value.toLowerCase().trim(),
         gender: genderFilter.value,
         species: speciesFilter.value,
         status: statusFilter.value
     };
     
     currentPage = 1;
     applyFiltersAndRender();
 }

 function applyFiltersAndRender() {
     // Aplicar filtros
     filteredCharacters = allCharacters.filter(character => {
         const matchesName = !currentFilters.name || 
             character.name.toLowerCase().includes(currentFilters.name);
         const matchesGender = !currentFilters.gender || 
             character.gender === currentFilters.gender;
         const matchesSpecies = !currentFilters.species || 
             character.species === currentFilters.species;
         const matchesStatus = !currentFilters.status || 
             character.status === currentFilters.status;
         
         return matchesName && matchesGender && matchesSpecies && matchesStatus;
     });
     
     renderCharacters();
     updatePaginationButtons();
 }

 function renderCharacters() {
     const charactersPerPage = 8;
     const startIndex = (currentPage - 1) * charactersPerPage;
     const endIndex = startIndex + charactersPerPage;
     const charactersToShow = filteredCharacters.slice(startIndex, endIndex);
     
     if (charactersToShow.length === 0) {
         charactersGrid.innerHTML = `
             <div style="grid-column: 1 / -1; text-align: center; color: #00ff7f; font-size: 1.2rem; padding: 2rem;">
                 <p>🛸 No se encontraron personajes con estos filtros</p>
                 <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                     Intenta ajustar los filtros para ver más resultados
                 </p>
             </div>
         `;
         return;
     }
     
     charactersGrid.innerHTML = charactersToShow.map(character => 
         createCharacterCard(character)
     ).join('');
     
     // Agregar animación 
     const cards = document.querySelectorAll('.character-card');
     cards.forEach((card, index) => {
         card.style.animation = `slideInUp 0.5s ease forwards`;
         card.style.animationDelay = `${index * 0.1}s`;
         card.style.opacity = '0';
         card.style.transform = 'translateY(20px)';
     });
 }

 function createCharacterCard(character) {
     const statusClass = `status-${character.status.toLowerCase()}`;
     const statusIcon = '●';
     
     return `
         <div class="character-card" data-character-id="${character.id}">
             <div class="character-image">
                 <img src="${character.image}" alt="${character.name}" loading="lazy">
             </div>
             <div class="character-info">
                 <h3 class="character-name">${character.name}</h3>
                 <p class="character-status">
                     <span class="${statusClass}">${statusIcon}</span> ${character.status}
                 </p>
                 <p class="character-species">${character.species}</p>
                 <p class="character-origin">${character.origin.name}</p>
             </div>
         </div>
     `;
 }

 function changePage(direction) {
     const charactersPerPage = 8;
     const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
     
     const newPage = currentPage + direction;
     
     if (newPage >= 1 && newPage <= totalPages) {
         currentPage = newPage;
         renderCharacters();
         updatePaginationButtons();
         
         // Scroll suave hacia arriba
         document.querySelector('.characters-grid').scrollIntoView({
             behavior: 'smooth',
             block: 'start'
         });
     }
 }

 function updatePaginationButtons() {
     const charactersPerPage = 8;
     const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
     
     prevButton.disabled = currentPage === 1;
     nextButton.disabled = currentPage === totalPages || totalPages === 0;
     
     // Agregar clases para estilos disabled
     prevButton.classList.toggle('disabled', currentPage === 1);
     nextButton.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
 }

 function showLoading() {
     charactersGrid.innerHTML = `
         <div style="grid-column: 1 / -1; text-align: center; color: #00ff7f; font-size: 1.2rem; padding: 3rem;">
             <div class="loading-portal" style="
                 display: inline-block;
                 width: 50px;
                 height: 50px;
                 border: 3px solid rgba(0, 255, 127, 0.3);
                 border-top: 3px solid #00ff7f;
                 border-radius: 50%;
                 animation: spin 1s linear infinite;
                 margin-bottom: 1rem;
             "></div>
             <p>Abriendo portales y cargando personajes...</p>
             <p style="margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.8;">
                 ¡Wubba lubba dub dub!
             </p>
         </div>
     `;
 }

 function showError(message) {
     charactersGrid.innerHTML = `
         <div style="grid-column: 1 / -1; text-align: center; color: #e74c3c; font-size: 1.2rem; padding: 2rem;">
             <p>🚫 ${message}</p>
         </div>
     `;
 }

 // Función para búsqueda en tiempo real más eficiente
 function debounce(func, wait) {
     let timeout;
     return function executedFunction(...args) {
         const later = () => {
             clearTimeout(timeout);
             func(...args);
         };
         clearTimeout(timeout);
         timeout = setTimeout(later, wait);
     };
 }