//budget controller
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value;
        }); 
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        perentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // create new item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } 
            
            //push it into our data structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // id = 3
            //data.allItems[type][id];
            //ids = [1 2 4 6 8]
            // index = 3

            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

    calculateBudget: function() {
        // caculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');

        // calculate the budget: income-expenses
        data.budget = data.totals.inc - data.totals.exp;

        // calculate the perentage of income that we spent
        if (data.totals.inc > 0) {
            data.perentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.perentage = -1;
        } 
        
    },   

    calculatePercentages: function() {

        /*
        a=20
        b=10
        c=40
        income = 100
        a=20/100=20%
        b=10/100=10%
        c=40/100=40%
        */

        data.allItems.exp.forEach(function(cur) {
            cur.calcPercentage(data.totals.inc);
        });
    },

    getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
        });
        return allPerc;
    },
    
    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.perentage
        };
    },

        testing: function() {
            console.log(data);
        }
    };

})();


//ui controller
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage'
    };

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };   
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create html strings with placeholder txt

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            //replace placeholder text with some actual data
            newHtml = html.replace('%id', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert the html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },


        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";

            });
            
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            var nodeListForEach = function(List, callback) {
                for (var i = 0; i < List.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        }, 

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();


//global app controller
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 

        document.addEventListener('keypress', function(event) {

        if (event.keycode === 13 || event.which === 13) {
            ctrlAddItem();
        }

    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
};

    var updateBudget = function() {
        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2. return the budget
        var budget = budgetCtrl.getBudget();

        //3. display the budget on the ui
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. update the UI with new percentage
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. get the field input data
         input = UICtrl.getinput();
        
         if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            //2. add the item to the budget controller
             newItem = budgetCtrl.addItem(input.type, input.description, input.value);

             //3. add the new item to the ui
            UICtrl.addListItem(newItem, input.type);
 
            //4. clear the fields
            UICtrl.clearFields();
 
            //5. calculate and update budget
            updateBudget();

            //6. calculate and update percentages
            updatePercentages();
         }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  

        if (itemID) {

            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2 delete the item from ui
            UICtrl.deleteListItem(itemID);

            //3 update and show the new budget
            updateBudget();

            //4.calculate and update percentages
            updatePercentages();
        }

    };

    return {
        init: function() {
            console.log('app has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            }); 
            setupEventListeners();
        }
    };    

})(budgetController, UIController);

controller.init();