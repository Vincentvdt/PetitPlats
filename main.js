const gallery = document.querySelector(".recipes")
const tagsWrapper = document.querySelector(".tags")
const searchBar = document.querySelector(".search-bar")

let tags = []
let displayedRecipes = [...recipes]

// Function to capitalize the first letter of a string
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

// Function to display the recipes
const displayRecipes = recipes => {

    const fragment = document.createDocumentFragment()

    for (const recipe of recipes) {
        const card = createRecipeTemplate(recipe).getRecipeHTML()
        fragment.appendChild(card)
    }

    gallery.innerHTML = ""
    gallery.appendChild(fragment)
    displayedRecipes = recipes
    const counterElement = document.querySelector(".recipes_count")
    // Update recipes counter
    if (displayedRecipes.length === 0) {
        counterElement.textContent = "Aucune recette"
        gallery.textContent = "Aucune recette disponible pour l'instant. Essayez quelque chose d'autre!"

    } else {
        const pluralSuffix = displayedRecipes.length === 1 ? "" : "s"
        const formattedCount = displayedRecipes.length.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false
        })
        counterElement.textContent = `${formattedCount} recette${pluralSuffix}`
    }

    updateDropdownOptions()
}

// Function to update tags
const updateTags = () => {

    tagsWrapper.innerHTML = ""
    const fragment = document.createDocumentFragment()

    for (const tag of tags) {
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
    }

    tagsWrapper.appendChild(fragment)
    filterRecipes()
}

// Removes a tag from the tags array and update displayed tags.
const removeTag = tag => {
    const tagIndex = tags.indexOf(tag)

    if (tagIndex !== -1) {
        tags.splice(tagIndex, 1)
        updateTags()
    }
}

const filterRecipes = () => {
    let filteredRecipes = recipes
    const input = searchBar.querySelector("input")
    const searchQuery = input.value.toLowerCase().trim()
    let recipeTags = []

    if (tags.length) {
        const tempFilteredRecipes = []
        for (const recipe of filteredRecipes) {
            recipeTags = getRecipeTags(recipe)
            if (tags.every(tag => Array.from(recipeTags).includes(tag.name))) {
                tempFilteredRecipes.push(recipe)
            }
        }
        filteredRecipes = tempFilteredRecipes
    }

    if (searchQuery.length >= 3) {
        const tempFilteredRecipes = []
        for (const recipe of filteredRecipes) {
            recipeTags = getRecipeTags(recipe, "ingredients")
            if (
                recipe.name.toLowerCase().includes(searchQuery) ||
                recipe.description.toLowerCase().includes(searchQuery) ||
                Array.from(recipeTags).some(tag => tag.includes(searchQuery))
            ) {
                tempFilteredRecipes.push(recipe)
            }
        }
        filteredRecipes = tempFilteredRecipes

    }

    if (filteredRecipes.length === 0) {
        displayedRecipes = recipes
    }
    displayRecipes(filteredRecipes)
}

searchBar.addEventListener("input", e => {
    e.preventDefault()
    filterRecipes()
})

searchBar.addEventListener("submit", e => {
    e.preventDefault()
    filterRecipes()
    searchBar.querySelector("input").value = ""
})

//  Updates the dropdown filters based on the filtered recipes
const updateDropdownOptions = () => {
    if (displayedRecipes.length <= 0 && !tags.length) {
        displayedRecipes = recipes
    }
    const extractedOptions = getAllRecipesInformation(displayedRecipes)

    const categorizedTags = {
        ingredients: [],
        appliances: [],
        utensils: []
    }

    for (const tag of tags) {
        const tagLowerCase = tag.name.toLowerCase()
        if (tag.type === "ingredient") {
            categorizedTags.ingredients.push(tagLowerCase)
        } else if (tag.type === "appliance") {
            categorizedTags.appliances.push(tagLowerCase)
        } else if (tag.type === "utensil") {
            categorizedTags.utensils.push(tagLowerCase)
        }
    }

    const filterCategory = (category, options) => {
        const filteredOptions = []
        for (const option of Array.from(options)) {
            if (!categorizedTags[category].includes(option.toLowerCase())) {
                filteredOptions.push(option)
            }
        }
        return filteredOptions
    }

    const filteredIngredients = filterCategory("ingredients", extractedOptions.ingredients)
    const filteredAppliances = filterCategory("appliances", extractedOptions.appliances)
    const filteredUtensils = filterCategory("utensils", extractedOptions.utensils)

    dropdownIngredient.updateDisplayedOptions(filteredIngredients)
    dropdownAppliance.updateDisplayedOptions(filteredAppliances)
    dropdownUtensil.updateDisplayedOptions(filteredUtensils)
}

// Function to extract tags from a recipe
const getRecipeTags = (recipe, singleType = null) => {
    const {ingredients, appliances, utensils} = extractSingleRecipeInformation(recipe)

    let recipeTags

    switch (singleType) {
        case "ingredients":
            recipeTags = Array.from(ingredients)
            break
        case "appliances":
            recipeTags = Array.from(appliances)
            break
        case "utensils":
            recipeTags = Array.from(utensils)
            break
        default:
            recipeTags = [...ingredients, ...appliances, ...utensils]
    }

    const lowerCaseTagSet = new Set()
    for (const tag of recipeTags) {
        lowerCaseTagSet.add(tag.toLowerCase())
    }
    return lowerCaseTagSet
}

// Extracts unique ingredients, appliances, and utensils from a list of recipes.
function getAllRecipesInformation(recipes) {
    const result = {
        ingredients: new Set(),
        appliances: new Set(),
        utensils: new Set(),
    }

    for (const recipe of recipes) {
        const singleRecipeInfo = extractSingleRecipeInformation(recipe)

        for (const ingredient of singleRecipeInfo.ingredients) {
            result.ingredients.add(ingredient)
        }

        result.appliances.add(recipe.appliance)

        for (const utensil of singleRecipeInfo.utensils) {
            result.utensils.add(utensil)
        }
    }

    return result
}

function extractSingleRecipeInformation(recipe) {
    const ingredientsSet = new Set()
    const appliancesSet = new Set()
    const utensilsSet = new Set()

    for (const ingredient of recipe.ingredients) {
        ingredientsSet.add(ingredient.ingredient)
    }

    appliancesSet.add(recipe.appliance)

    for (const utensil of recipe.utensils) {
        utensilsSet.add(utensil)
    }

    return {
        ingredients: ingredientsSet,
        appliances: appliancesSet,
        utensils: utensilsSet,
    }
}

// Display initial recipes and init dropdowns
const {ingredients, appliances, utensils} = getAllRecipesInformation(displayedRecipes)

const dropdownIngredient = new Dropdown(document.querySelector("#ingredient"), Array.from(ingredients))
dropdownIngredient.init()
const dropdownAppliance = new Dropdown(document.querySelector("#appliance"), Array.from(appliances))
dropdownAppliance.init()
const dropdownUtensil = new Dropdown(document.querySelector("#utensil"), Array.from(utensils))
dropdownUtensil.init()
displayRecipes(displayedRecipes)



