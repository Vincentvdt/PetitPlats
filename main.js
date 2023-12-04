const gallery = document.querySelector(".recipes")
const tagsWrapper = document.querySelector(".tags")
const searchBar = document.querySelector(".search-bar input")

let tags = []
let displayedRecipes = []

// Function to display recipes
const displayRecipes = recipes => {
    displayedRecipes = []
    const fragment = document.createDocumentFragment()

    recipes.forEach(recipe => {
        const card = createRecipeTemplate(recipe).getRecipeHTML()
        displayedRecipes.push(card)
        fragment.appendChild(card)
    })

    gallery.innerHTML = ""
    gallery.appendChild(fragment)
    updateRecipesCounter()
}

// Function to update recipes counter
const updateRecipesCounter = () => {
    const counter = document.querySelector(".recipes_count")

    if (displayedRecipes.length === 0) {
        counter.textContent = "Aucune recette"
        gallery.textContent = "Aucune recette"
    } else {
        counter.textContent = `${displayedRecipes.length.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false
        })} ${displayedRecipes.length === 1 ? "recette" : "recettes"}`
    }
}

// Display initial recipes
displayRecipes(recipes)

// Function to capitalize the first letter of a string
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

// Function to update tags
const updateTags = () => {
    tagsWrapper.innerHTML = ""
    const fragment = document.createDocumentFragment()

    tags.forEach(tag => {
        const tagElem = document.createElement("button")
        tagElem.className = "tag-item"
        tagElem.dataset.type = tag.type
        tagElem.dataset.value = tag.name.toLowerCase()
        tagElem.innerHTML = `
            ${capitalize(tag.name)}
            <svg fill="none" height="13" viewBox="0 0 14 13" width="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5"  stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2.16667"/>
            </svg>`
        fragment.appendChild(tagElem)

        // Remove Tag
        tagElem.addEventListener("click", () => removeTag(tag))
    })

    tagsWrapper.appendChild(fragment)

    updateFilteredRecipes()
}

// Removes a tag from the tags array and update displayed tags.
const removeTag = tag => {
    const tagIndex = tags.indexOf(tag)

    if (tagIndex !== -1) {
        tags.splice(tagIndex, 1)

        const tagTypeElement = document.querySelector(`#${tag.type}`)
        const optionItems = tagTypeElement.querySelectorAll(".option-item")

        const matchingOption = Array.from(optionItems).find(option => {
            return option.dataset.value.toLowerCase() === tag.name.toLowerCase()
        })

        if (matchingOption) {
            matchingOption.style.display = "flex"
        }

        updateTags()
        handleSearch()
    }
}

//  Updates the dropdown filters based on the filtered recipes
const updateFilters = filteredRecipes => {
    const filteredOptions = getAllIngredientsAndTools(filteredRecipes)

    const categorizedTags = {
        ingredients: tags.filter(tag => tag.type === "ingredient").map(tag => tag.name.toLowerCase()),
        appliances: tags.filter(tag => tag.type === "appliance").map(tag => tag.name.toLowerCase()),
        utensils: tags.filter(tag => tag.type === "utensil").map(tag => tag.name.toLowerCase())
    }

    const filterCategory = (category, options) => Array.from(options).filter(option => !categorizedTags[category].includes(option.toLowerCase()))

    const filteredIngredients = filterCategory("ingredients", filteredOptions.ingredients)
    const filteredAppliances = filterCategory("appliances", filteredOptions.appliances)
    const filteredUtensils = filterCategory("utensils", filteredOptions.utensils)

    dropdown1.updateDisplayedOptions(filteredIngredients)
    dropdown2.updateDisplayedOptions(filteredAppliances)
    dropdown3.updateDisplayedOptions(filteredUtensils)
}

// Function to extract tags from a recipe
const getRecipeTags = recipe => {
    const ingredientTags = recipe.ingredients.map(ingredient => ingredient.ingredient.toLowerCase())
    const utensilTags = recipe.utensils.map(utensil => utensil.toLowerCase())

    return new Set([...ingredientTags, recipe.appliance.toLowerCase(), ...utensilTags])
}

// Function to update recipes based on filters
const updateFilteredRecipes = () => {
    const filteredRecipes = recipes.filter(recipe => {
        const recipeTags = getRecipeTags(recipe)
        return tags.every(tag => recipeTags.has(tag.name.toLowerCase()))
    })

    displayRecipes(filteredRecipes)
    updateFilters(filteredRecipes)
}

// Function to handle search
function handleSearch() {
    const searchQuery = searchBar.value.toLowerCase().trim()
    const searchResults = recipes.filter(recipe => {
        const recipeTags = getRecipeTags(recipe)
        return (
            recipe.name.toLowerCase().includes(searchQuery) ||
            Array.from(recipeTags).some(tag => tag.includes(searchQuery))
        )
    })

    displayRecipes(searchResults)
    updateFilters(searchResults)
}

// Event listener for the search bar
searchBar.addEventListener("input", handleSearch)

// Extracts unique ingredients, appliances, and utensils from a list of recipes.
function getAllIngredientsAndTools(recipes) {
    const ingredientsSet = new Set()
    const appliancesSet = new Set()
    const utensilsSet = new Set()

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => ingredientsSet.add(ingredient.ingredient))
        appliancesSet.add(recipe.appliance)
        recipe.utensils.forEach(utensil => utensilsSet.add(utensil))
    })

    return {
        ingredients: ingredientsSet,
        appliances: appliancesSet,
        utensils: utensilsSet,
    }
}

const {ingredients, appliances, utensils} = getAllIngredientsAndTools(recipes)

const dropdown1 = new Dropdown(document.querySelector("#ingredient"), Array.from(ingredients))
dropdown1.init()
const dropdown2 = new Dropdown(document.querySelector("#appliance"), Array.from(appliances))
dropdown2.init()
const dropdown3 = new Dropdown(document.querySelector("#utensil"), Array.from(utensils))
dropdown3.init()