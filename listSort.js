class ListSort {
    constructor(element) {
        this.main = element;

        this.config = {
            list: 'data-lf-order-list',
            listItems: 'data-lf-sort-item',
            filters: 'data-lf-filter',
            sortingElements: 'data-lf-order-element',
            pagination: false,
            paginationMax: 6
        };

        this.shadowSortObject = {};
    }

    loadConfig(config) {
        if (typeof config !== 'object') {
            throw new TypeError('the config parameter should be a literal object');
        }

        if (!config.list) {
            config.list = this.config.list;
        }

        if (!config.listItems) {
            config.listItems = this.config.listItems;
        }

        if (!config.filters) {
            config.filters = this.config.filters;
        }

        if (!config.sortingElements) {
            config.sortingElements = this.config.sortingElements;
        }

        if (!config.pagination) {
            config.pagination = this.config.pagination;
        }

        if (!config.paginationMax) {
            config.paginationMax = this.config.paginationMax;
        }

        this.config = config;

        this.list = this.main.querySelector('['+ this.config.list +']');
        this.listItems = this.list.querySelectorAll('['+ this.config.listItems +']');
        this.filters = this.main.querySelectorAll('['+ this.config.filters +']');
        this.sortingElements = this.main.querySelectorAll('['+ this.config.sortingElements +']');
    }

    init(config = this.config) {
        this.loadConfig(config);

        [].forEach.call(this.filters, filter => {
            this.shadowSortObject[filter.dataset.lfFilter] = {
                filterName: filter.dataset.lfFilter,
                sort: filter.dataset.lfSort,
                elements: []
            };

            this.bindFilterTargets(filter);
            filter.addEventListener('click', this.sort.bind(this, filter));
        });

        if (this.config.pagination && this.config.paginationMax < this.listItems.length) {
            this.initPagination(this.listItems);
        }
    }

    bindFilterTargets(filter) {
        [].forEach.call(this.sortingElements, element => {
            if (element.dataset.lfSortingTarget === filter.dataset.lfFilter) {
                this.shadowSortObject[element.dataset.lfSortingTarget].elements.push(element);
            }
        });
    }

    sort(filter) {
        const target = this.shadowSortObject[filter.dataset.lfFilter];
        const elementsArray = target.elements;
        const filterName = target.filterName;
        const sortOrder = target.sort;

        const sortedArray = elementsArray.sort((a, b) => {
            if (filterName === 'date') {
                if (sortOrder === 'asc') {
                    return new Date(b.dataset.lfOrderElement) - new Date(a.dataset.lfOrderElement);
                }

                return new Date(a.dataset.lfOrderElement) - new Date(b.dataset.lfOrderElement);
            }

            if (sortOrder === 'asc') {
                return a.dataset.lfOrderElement - b.dataset.lfOrderElement;
            }

            return b.dataset.lfOrderElement - a.dataset.lfOrderElement;
        });

        this.renderList(sortedArray);
        if (this.config.pagination && this.config.paginationMax < this.listItems.length) {
            this.initPagination(this.listItems);
        }

        if (filter.dataset.lfSort === 'asc') {
            filter.dataset.lfSort = 'desc';
            this.shadowSortObject[filter.dataset.lfFilter].sort = 'desc';
            return true;
        }

        if (filter.dataset.lfSort === 'desc') {
            filter.dataset.lfSort = 'asc';
            this.shadowSortObject[filter.dataset.lfFilter].sort = 'asc';
        }

        return true;
    }

    renderList(sortedArray) {
        const parentListEl = this.list.parentElement;
        const newList = this.list.cloneNode(false);
        const newItemsList = [];

        sortedArray.forEach(element => {
            let parent = element.parentElement;
            while(!parent.hasAttribute('data-lf-order-list') && !parent.hasAttribute('data-lf-sort-item')) {
                parent = parent.parentElement;
            }

            newItemsList.push(parent.cloneNode(true));
        });

        newItemsList.forEach(item => {
            newList.appendChild(item);
        });

        parentListEl.removeChild(this.list);
        parentListEl.appendChild(newList);

        this.list = newList;
        this.resetList(newList);
    }

    initPagination(items) {
        const pageNumber = Math.ceil(items.length / this.config.paginationMax);
        const maxItems = this.config.paginationMax - 1;

        const dataListSortPagination = document.querySelector('[data-list-sort-pagination-container]');

        if (dataListSortPagination) {
            dataListSortPagination.parentElement.removeChild(dataListSortPagination);
        }

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'list-sort-pagination';
        paginationContainer.setAttribute('data-list-sort-pagination-container', '');

        this.main.appendChild(paginationContainer);

        for (let index = items.length; index > maxItems; index--) {
            if (items[index]) {
                const element = items[index];
                element.style.display = 'none';
            }
        }

        for (let index = 0; index < pageNumber; index++) {
            const paginationButton = document.createElement('span');
            paginationButton.innerHTML = index + 1;
            paginationButton.className = 'list-sort-pagination__button';

            if (index === 0) {
                paginationButton.className = 'list-sort-pagination__button active';
            }

            paginationButton.setAttribute('data-list-sort-pagination', index + 1);

            paginationContainer.appendChild(paginationButton);
            this.bindPagination(paginationButton);
        }
    }

    bindPagination(element) {
        element.addEventListener('click', () => {
            const maxItems = this.config.paginationMax;
            const paginationButtons = this.main.querySelectorAll('[data-list-sort-pagination]');

            [].forEach.call(paginationButtons, button => {
                button.classList.remove('active');
            });

            element.classList.add('active');

            const pageNumber = parseInt(element.getAttribute('data-list-sort-pagination'));
            const loopStart = pageNumber <= 1 ? 0 : maxItems * (pageNumber - 1);

            for (let index = 0; index < this.listItems.length; index++) {
                const listItem = this.listItems[index];
                listItem.style.display = 'none';
            }

            for (let index = loopStart; index < loopStart + maxItems; index++) {
                if (this.listItems[index]) {
                    const listItem = this.listItems[index];
                    listItem.style.display = 'block';
                }
            }
        });
    }

    resetList(list) {
        this.listItems = list.querySelectorAll('['+ this.config.listItems +']');

        [].forEach.call(this.listItems, (listItem) => {
            listItem.removeAttribute('style');
        });
    }
}

export default ListSort;
