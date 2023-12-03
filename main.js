const gallery = document.querySelector(".recipes");
const tagsWrapper = document.querySelector(".tags");
const searchBar = document.querySelector(".search-bar input");

let tags = [];
let displayedRecipes = [];

// Function to display recipes
const displayRecipes = recipes => {
    displayedRecipes = [];
    const fragment = document.createDocumentFragment();

    recipes.forEach(recipe => {
        const card = createRecipeTemplate(recipe).getRecipeHTML();
        displayedRecipes.push(card);
        fragment.appendChild(card);
    });

    gallery.innerHTML = "";
    gallery.appendChild(fragment);
    updateRecipesCounter();
};

// Function to update recipes counter
const updateRecipesCounter = () => {
    const counter = document.querySelector(".recipes_count");

    if (displayedRecipes.length === 0) {
        counter.textContent = "Aucune recette";
        gallery.textContent = "Aucune recette";
    } else {
        counter.textContent = `${displayedRecipes.length.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })} ${displayedRecipes.length === 1 ? "recette" : "recettes"}`;
    }
};

// Display initial recipes
displayRecipes(recipes);

// Function to capitalize the first letter of a string
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Function to update tags
const updateTags = () => {
    tagsWrapper.innerHTML = "";
    const fragment = document.createDocumentFragment();

    tags.forEach(tag => {
        const tagElem = document.createElement("div");
        tagElem.className = "tag-item";
        tagElem.dataset.type = tag.type;
        tagElem.dataset.value = tag.name.toLowerCase();
        tagElem.innerHTML = `
            ${capitalize(tag.name)}
            <svg fill="none" height="13" viewBox="0 0 14 13" width="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5"  stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2.16667"/>
            </svg>`;
        fragment.appendChild(tagElem);

        // Remove Tag
        tagElem.addEventListener("click", () => removeTag(tag));
    });

    tagsWrapper.appendChild(fragment);

    updateFilteredRecipes();
};

// Removes a tag from the tags array and update displayed tags.
const removeTag = tag => {
    const tagIndex = tags.indexOf(tag);

    if (tagIndex !== -1) {
        tags.splice(tagIndex, 1);

        const tagTypeElement = document.querySelector(`#${tag.type}`);
        const optionItems = tagTypeElement.querySelectorAll(".option-item");

        const matchingOption = Array.from(optionItems).find(option => {
            return option.dataset.value.toLowerCase() === tag.name.toLowerCase();
        });

        if (matchingOption) {
            matchingOption.style.display = "flex";
        }

        updateTags();
    }
}

//  Updates the dropdown filters based on the filtered recipes
const updateFilters = filteredRecipes => {
    let filteredOptions = getAllIngredientsAndTools(filteredRecipes);
    let categorizedTags = {
        ingredients: tags.filter(tag => tag.type === "ingredient").map(tag => tag.name.toLowerCase()),
        appliances: tags.filter(tag => tag.type === "appliance").map(tag => tag.name.toLowerCase()),
        utensils: tags.filter(tag => tag.type === "utensil").map(tag => tag.name.toLowerCase()),
    }

    filteredOptions = {
        ingredients: filteredOptions.ingredients
            .filter(ingredient => !categorizedTags.ingredients.includes(ingredient.toLowerCase())),
        appliances: filteredOptions.appliances
            .filter(appliance => !categorizedTags.appliances.includes(appliance.toLowerCase())),
        utensils: filteredOptions.utensils
            .filter(utensil => !categorizedTags.utensils.includes(utensil.toLowerCase())),
    }

    dropdown1.updateDisplayedOptions(Array.from(filteredOptions.ingredients))
    dropdown2.updateDisplayedOptions(Array.from(filteredOptions.appliances))
    dropdown3.updateDisplayedOptions(Array.from(filteredOptions.utensils))
}

// Function to extract tags from a recipe
const getRecipeTags = recipe => {
    const ingredients = recipe.ingredients.map(ingredient => ingredient.ingredient.toLowerCase());
    const utensils = recipe.utensils.map(utensil => utensil.toLowerCase());

    return new Set([...ingredients, recipe.appliance.toLowerCase(), ...utensils]);
};

// Function to update recipes based on filters
const updateFilteredRecipes = () => {
    const filteredRecipes = recipes.filter(recipe => {
        const recipeTags = getRecipeTags(recipe);

        const matchTitle = recipe.name.toLowerCase().includes(searchBar.value.toLowerCase().trim());
        const matchTags = tags.every(tag => recipeTags.has(tag.name.toLowerCase()));

        return matchTitle && matchTags;
    });

    displayRecipes(filteredRecipes);
    updateFilters(filteredRecipes);
};

// Function to handle search
function handleSearch() {
    const searchQuery = searchBar.value.toLowerCase().trim();

    const searchResults = recipes.filter(recipe => {
        const recipeTags = getRecipeTags(recipe);
        return (
            recipe.name.toLowerCase().includes(searchQuery) ||
            Array.from(recipeTags).some(tag => tag.includes(searchQuery))
        );
    });

    displayRecipes(searchResults);
    updateFilters(searchResults);
}

// Event listener for the search bar
searchBar.addEventListener('input', handleSearch);

// Extracts unique ingredients, appliances, and utensils from a list of recipes.
function getAllIngredientsAndTools(recipes) {
    let ingredientsSet = new Set();
    let appliancesSet = new Set();
    let utensilsSet = new Set();

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            ingredientsSet.add(ingredient.ingredient.toLowerCase());
        });

        appliancesSet.add(recipe.appliance.toLowerCase());

        recipe.utensils.forEach(utensil => {
            utensilsSet.add(utensil.toLowerCase());
        });
    });

    const ingredients = Array.from(ingredientsSet).map(capitalize);
    const appliances = Array.from(appliancesSet).map(capitalize);
    const utensils = Array.from(utensilsSet).map(capitalize);

    return {ingredients, appliances, utensils};
}

const {ingredients, appliances, utensils} = getAllIngredientsAndTools(recipes);

const dropdown1 = new Dropdown(document.querySelector("#ingredient"), Array.from(ingredients));
dropdown1.init();
const dropdown2 = new Dropdown(document.querySelector("#appliance"), Array.from(appliances));
dropdown2.init();
dropdown1.link(dropdown2);
const dropdown3 = new Dropdown(document.querySelector("#utensil"), Array.from(utensils));
dropdown3.init();
dropdown2.link(dropdown3);
