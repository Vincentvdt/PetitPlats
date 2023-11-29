const gallery = document.querySelector(".recipes")
const tagsWrapper = document.querySelector(".tags")
const fragment = document.createDocumentFragment()
let tags = []
recipes.forEach(recipe => {
    const card = createRecipeTemplate(recipe).getRecipeHTML();
    fragment.appendChild(card);
});

gallery.appendChild(fragment);
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const updateTags = () => {
    tagsWrapper.innerHTML = ""
    const fragment = document.createDocumentFragment()
    tags.forEach(tag => {
        const tagElem = document.createElement("div");
        tagElem.className = "tag-item";
        tagElem.dataset.type = tag.type
        tagElem.dataset.value = tag.name.toLowerCase()
        tagElem.innerHTML = `
            ${capitalize(tag.name)}
            <svg fill="none" height="13" viewBox="0 0 14 13" width="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5"  stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2.16667"/>
            </svg>`
        fragment.appendChild(tagElem)

        tagElem.addEventListener("click", () => {
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
        })
    })
    tagsWrapper.appendChild(fragment)
}

class Dropdown {
    constructor(dropdownElement, options) {
        this.dropdown = dropdownElement
        this.initialOptions = options
        this.optionElements = []

        this.type = this.dropdown.id
        this.value = null

        this.btn = this.dropdown.querySelector(".select-btn")
        this.input = this.dropdown.querySelector("input")
        this.optionsContainer = this.dropdown.querySelector(".options-wrapper")
        this.resetBtn = this.dropdown.querySelector(".reset-icon")
    }

    init() {
        this.updateDisplayedOptions(this.initialOptions)
        this.focusableInsideElements = this.dropdown.querySelectorAll("*[tabindex='-1']:not(.options-wrapper)")
        this.focusableOutsideElements = this.getFocusableElementsOutsideDropdown()

        if (this.input.value) {
            this.resetBtn.style.display = "block"
            let isHidden = this.resetBtn.style.display === "block" ? "false" : "true";
            this.resetBtn.setAttribute("aria-hidden", isHidden);
        }

        this.setEventListener()
    }

    setEventListener() {
        this.btn.addEventListener("click", this.toggle.bind(this))
        this.resetBtn.addEventListener("click", this.reset.bind(this))
        this.input.addEventListener('input', e => {
            e.preventDefault();
            const value = this.input.value;
            this.resetBtn.style.display = value ? "block" : "none";
            let hidden = this.resetBtn.style.display === "block" ? "false" : "true"
            this.resetBtn.setAttribute("aria-hidden", hidden)
        })
    }

    createOptionsList(options) {
        const fragment = document.createDocumentFragment()
        options.forEach(option => {
            fragment.appendChild(this.createOptionDOM(option))
        })
        return fragment
    }

    createOptionDOM(option) {
        let value = option.trim()
        let link = document.createElement('a')
        link.className = "option-item"
        link.dataset.value = option.toLowerCase()
        link.setAttribute("role", "menuitem")
        link.setAttribute("tabindex", "-1")
        link.textContent = value
        link.href = "#"
        return link
    }

    getFocusableElementsOutsideDropdown() {
        const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        return Array.from(focusableElements).filter(element => !this.dropdown.contains(element));
    }

    toggle() {
        this.dropdown.dataset.toggle === "collapse" ? this.open() : this.close()
    }

    updateDisplayedOptions(newOptions) {
        if (!Array.isArray(newOptions) || !newOptions.every(option => typeof option === "string")) {
            console.error(newOptions, "Please provide a valid array of strings for options");
            return;
        }

        let updatedOptionsList = this.createOptionsList(newOptions);
        this.optionsContainer.innerHTML = "";
        this.optionsContainer.appendChild(updatedOptionsList);
        this.optionElements = this.dropdown.querySelectorAll(".option-item");
    }

    searchOnChange(e) {
        const searchTerm = e.target.value.toLowerCase().trim();

        let filteredOptions = searchTerm.length >= 3
            ? this.initialOptions.filter(option => option.toLowerCase().includes(searchTerm))
            : this.initialOptions;
        this.updateDisplayedOptions(filteredOptions);

        if (filteredOptions.length === 0) {
            const noResultsElement = document.createElement('p');
            noResultsElement.textContent = "No results found";
            noResultsElement.className = 'no-options-found';
            this.optionsContainer.innerHTML = "";
            this.optionsContainer.appendChild(noResultsElement);
        }

    }

    handleClick(e) {
        e.preventDefault()
        // Click outside the dropdown
        if (!this.dropdown.contains(e.target)) {
            this.close();
            return;
        }
        // Select an option

        if (Array.from(this.optionElements).includes(e.target)) {
            if (e.target.style.display === "none") {
                return;
            }
            const clickedOption = Array.from(this.optionElements).find(option => option === e.target);
            if (clickedOption) {
                clickedOption.style.display = 'none';
                this.createTag(this.type, clickedOption.dataset.value);
                this.close();
            }

            const filteredRecipes = recipes.filter(recipe => {
                const recipeTags = new Set([
                    ...recipe.ingredients.map(ingredient => ingredient.ingredient.toLowerCase()),
                    recipe.appliance.toLowerCase(),
                    ...recipe.ustensils.map(ustentil => ustentil.toLowerCase())
                ]);

                for (const tag of tags) {
                    const matchingTag = recipeTags.has(tag.name.toLowerCase());

                    if (!matchingTag) {
                        return false;
                    }
                }

                return true;
            })
            console.log(filteredRecipes)

            /*
            if (this.linkedSelect && this.linkedSelect.type === "appareil") {
                let ingredients = this.getTagsByType(this.type)
                let filteredRecipes = recipes.filter(recipe =>
                    ingredients.every(ingredient =>
                        recipe.ingredients.some(item => item.ingredient.toLowerCase() === ingredient.toLowerCase())
                    )
                )

                let filteredAppliance = new Set()
                filteredRecipes.map(recipe => filteredAppliance.add(recipe.appliance))
                this.linkedSelect.updateDisplayedOptions(Array.from(filteredAppliance))

            } else if (this.linkedSelect && this.linkedSelect.type === "ustentil") {
                let appareils = this.getTagsByType(this.type)
                const filteredRecipes = recipes.filter(recipe =>
                    appareils.every(appliance =>
                        recipe.appliance.toLowerCase() === appliance.toLowerCase()
                    )
                );

                let filteredUstentils = new Set()
                filteredRecipes.forEach(recipe => {
                    recipe.ustensils.forEach(ustentil => {
                        filteredUstentils.add(capitalize(ustentil));
                    });
                });
                this.linkedSelect.updateDisplayedOptions(Array.from(filteredUstentils))
            }
            */
        }
    }

    createTag(type, value) {
        tags.push({
            name: value,
            type
        })
        updateTags()
    }

    getTagsByType(type) {
        return tags.filter(tag => tag.type === type).map(tag => tag.name)
    }

    link(target) {
        this.linkedSelect = target
    }

    handleKey(e) {
        // Escape
        if (e.code === "Escape") {
            this.close()
        }
    }

    open() {
        this.focusableInsideElements.forEach(elem => {
            elem.setAttribute("tabindex", "0")
            elem.setAttribute("aria-hidden", "false")
        })
        this.focusableOutsideElements.forEach(elem => elem.setAttribute("tabindex", "-1"))

        this.boundClick = this.handleClick.bind(this)
        this.boundKey = this.handleKey.bind(this)
        this.boundSearchOnChange = this.searchOnChange.bind(this)

        document.addEventListener("click", this.boundClick)
        document.addEventListener("keydown", this.boundKey)
        this.input.addEventListener("input", this.boundSearchOnChange)

        this.dropdown.dataset.toggle = "extended"

    }

    close() {
        this.focusableInsideElements.forEach(elem => {
            elem.setAttribute("tabindex", "-1")
            elem.setAttribute("aria-hidden", "true")
        })
        this.focusableOutsideElements.forEach(elem => {
            elem.setAttribute("tabindex", "0")
            elem.setAttribute("aria-hidden", "false")
        })
        document.removeEventListener("click", this.boundClick)
        document.removeEventListener("keydown", this.boundKey)
        this.input.removeEventListener("input", this.boundSearchOnChange)
        this.dropdown.dataset.toggle = "collapse"
    }

    reset() {
        this.input.value = null;
        this.resetBtn.style.display = "none";
        this.resetBtn.setAttribute("aria-hidden", "true");
        this.updateDisplayedOptions(this.initialOptions)
        this.input.focus()
    }

}

function getAllIngredientsAndTools(recipes) {
    let ingredientsSet = new Set();
    let appliancesSet = new Set();
    let utensilsSet = new Set();

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            ingredientsSet.add(ingredient.ingredient.toLowerCase());
        });

        appliancesSet.add(recipe.appliance.toLowerCase());

        recipe.ustensils.forEach(utensil => {
            utensilsSet.add(utensil.toLowerCase());
        });
    });

    const ingredients = Array.from(ingredientsSet).map(capitalize);
    const appliances = Array.from(appliancesSet).map(capitalize);
    const utensils = Array.from(utensilsSet).map(capitalize);

    return {ingredients, appliances, utensils};
}

// Utilisation de la fonction avec la liste de recettes
const {ingredients, appliances, utensils} = getAllIngredientsAndTools(recipes);

const dropdown1 = new Dropdown(document.querySelector("#ingredient"), Array.from(ingredients));
dropdown1.init()
const dropdown2 = new Dropdown(document.querySelector("#appareil"), Array.from(appliances));
dropdown2.init()
dropdown1.link(dropdown2)
const dropdown3 = new Dropdown(document.querySelector("#ustentil"), Array.from(utensils));
dropdown3.init()
dropdown2.link(dropdown3)

document.addEventListener("keydown", e => {
    console.log(document.activeElement)
})