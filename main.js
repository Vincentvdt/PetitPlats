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
    for (let type in tags) {
        for (let tag of tags[type]) {
            const tagElem = document.createElement("div");
            tagElem.className = "tag-item";
            tagElem.dataset.type = type
            tagElem.dataset.value = tag.toLowerCase()
            tagElem.innerHTML = `
            ${tag}
            <svg fill="none" height="13" viewBox="0 0 14 13" width="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5" stroke="#1B1B1B" stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2.16667"/>
            </svg>`
            fragment.appendChild(tagElem)
        }
    }
    tagsWrapper.appendChild(fragment)
}

class Dropdown {
    constructor(dropdownElement, options) {
        this.dropdown = dropdownElement
        this.type = this.dropdown.id
        this.btn = this.dropdown.querySelector(".select-btn")
        this.input = this.dropdown.querySelector("input")
        this.optionsList = this.dropdown.querySelector(".options-wrapper")
        this.options = this.createOptionsList(options)
        this.resetBtn = this.dropdown.querySelector(".reset-icon")
        this.insideFocusableElements = this.dropdown.querySelectorAll("*[tabindex='-1']")
        this.outsideFocusableElements = this.getFocusableElementsOutsideDropdown()
        this.value = null
        this.linkedSelect = null;
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

    createOptionsList(options) {
        const fragment = document.createDocumentFragment()
        options.forEach(option => {
            fragment.appendChild(this.createOptionDOM(option))
        })
        this.optionsList.appendChild(fragment)
        return this.dropdown.querySelectorAll(".option-item")
    }

    getFocusableElementsOutsideDropdown() {
        const focusableElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        return Array.from(focusableElements).filter(element => !this.dropdown.contains(element));
    }

    init() {
        if (this.input.value) {
            this.resetBtn.style.display = "block"
            let hidden = this.resetBtn.style.display === "block" ? "false" : "true"
            this.resetBtn.setAttribute("aria-hidden", hidden)
        }

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

    toggle() {
        this.dropdown.dataset.toggle === "collapse" ? this.open() : this.close()
    }

    updateOptions(options) {
        this.optionsList.innerHTML = "";
        options.forEach(option => this.optionsList.appendChild(option))
    }

    searchOnChange(e) {
        const inputValue = e.target.value.toLowerCase().trim();

        let newOptions = inputValue.length >= 3
            ? Array.from(this.options).filter(option =>
                option.dataset.value.toLowerCase().includes(inputValue)
            )
            : this.options;
        this.updateOptions(newOptions);
        if (newOptions.length === 0) {
            const noFoundDOM = document.createElement('p');
            noFoundDOM.textContent = "Aucun résultat";
            noFoundDOM.className = 'no-options-found';
            this.optionsList.innerHTML = "";
            this.optionsList.appendChild(noFoundDOM);
        }
    }

    arrowNavigationHandler(direction) {
        const lastIndex = this.options.length - 1;
        if (this.index < 0 || this.index === null) {
            this.index = 0;
        } else if (direction === "ArrowDown") {
            this.index = (this.index < lastIndex) ? this.index + 1 : 0;
        } else if (direction === "ArrowUp") {
            this.index = (this.index > 0) ? this.index - 1 : lastIndex;
        }

        this.options[this.index].focus();
    }

    handleClick(e) {
        e.preventDefault()
        // Click outside the dropdown
        if (!this.dropdown.contains(e.target)) {
            this.close();
            return;
        }
        // Select an option
        if (Array.from(this.options).includes(e.target)) {
            this.value = e.target.dataset.value
            this.options.forEach(option => {
                option === e.target ?
                    option.setAttribute("aria-selected", true)
                    : option.removeAttribute("aria-selected")
            })
            this.createTag(this.type, this.value)
            this.hideOption(e.target)
            this.close()

        }
    }

    hideOption(option) {
        let optionIndex = Array.from(this.options).indexOf(option)
        this.options[optionIndex].style.display = "none";
    }

    showOption(option) {
        let optionIndex = Array.from(this.options).indexOf(option)
        this.options[optionIndex].style.display = "flex";
    }

    createTag(type, value) {
        if (tags[type]) {
            tags[type].push(capitalize(value));
        } else {
            tags[type] = [capitalize(value)];
        }
        updateTags()
    }

    getTagsByType(type) {
        return tags.filter(tag => tag.type === type)
    }

    link(target) {
        this.linkedSelect = {
            target,
            type: target.type
        }
    }

    handleKey(e) {
        // Escape
        if (e.code === "Escape") {
            this.close()
            return
        }
        // Arrow Navigation
        if (e.code === "ArrowUp" || e.code === "ArrowDown") {
            this.arrowNavigationHandler(e.code)
        }
    }

    open() {
        this.insideFocusableElements.forEach(elem => {
            elem.setAttribute("tabindex", "0")
            elem.setAttribute("aria-hidden", "false")
        })
        this.outsideFocusableElements.forEach(elem => elem.setAttribute("tabindex", "-1"))

        this.boundClick = this.handleClick.bind(this)
        this.boundKey = this.handleKey.bind(this)
        this.boundSearchOnChange = this.searchOnChange.bind(this)

        document.addEventListener("click", this.boundClick)
        this.index = -1;
        document.addEventListener("keydown", this.boundKey)
        this.input.addEventListener("input", this.boundSearchOnChange)

        this.dropdown.dataset.toggle = "extended";
        this.input.focus()
    }

    close() {
        this.insideFocusableElements.forEach(elem => {
            elem.setAttribute("tabindex", "-1")
            elem.setAttribute("aria-hidden", "true")
        })
        this.outsideFocusableElements.forEach(elem => {
            elem.setAttribute("tabindex", "0")
            elem.setAttribute("aria-hidden", "false")
        })
        document.removeEventListener("click", this.boundClick)
        document.removeEventListener("keydown", this.boundKey)
        this.input.removeEventListener("input", this.boundSearchOnChange)
        this.dropdown.dataset.toggle = "collapse"
        this.btn.focus()
    }

    reset() {
        this.input.value = null;
        this.resetBtn.style.display = "none";
        this.resetBtn.setAttribute("aria-hidden", "true");
        this.updateOptions(this.options)
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

