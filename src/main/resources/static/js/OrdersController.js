var orders;
var OrdersControllerModule = (function () {
        var showOrdersByTable = function () {
            var callback = {
                onSuccess: function () {
                    for (var item in orders) {
                        var prodList = orders[item];
                        _addNewOrder(item, prodList);
                    }
                },
                onFailed: function () {
                }
            };
            _getOrders(callback);
        };

        var _getOrders = function (callback) {
            RestControllerModule.getOrders({
                onSuccess: function (orderList) {
                    orders = orderList;
                    callback.onSuccess();
                },
                onFailed: function (error) {
                    console.log(error);
                    window.alert("There is a problem with our servers. We apologize for the inconvince, please try again later");
                }
            });

        };

        var _noOpCallback = function () {
            return {
                onSuccess: function () {
                }, onFailed: function () {

                }
            }
        };

        var _addNewOrder = function (idmesa, orden) {
            var tope = [];
            tope.push("Product");
            tope.push("Quantity");


            var table = document.createElement("TABLE");
            table.id = "Table" + idmesa;
            table.className = "table table-bordered table-striped table-sm table-dark";
            
            var cap = document.createElement('caption');
            tex = document.createTextNode('Order #' + idmesa);
            cap.appendChild(tex);
            table.appendChild(cap);
            
            var thd = document.createElement('thead');
            thd.setAttribute('class', 'thead-light');

            var trh = document.createElement('tr');
            for (var h = 0; h < 2; h++) {
                var th = document.createElement('th');
                th.setAttribute('scope', 'col');
                switch (h) {
                    case 0:
                        th.appendChild(document.createTextNode('Product'));
                        break;
                    case 1:
                        th.appendChild(document.createTextNode('Quantity'));
                        break;
                }
                trh.appendChild(th);
            }
            thd.appendChild(trh);
            table.appendChild(thd);            
            
            for (prod in orden.orderAmountsMap) {
                row = table.insertRow(-1);
                var cell = row.insertCell(-1);
                cell.innerHTML = prod;
                cell = row.insertCell(-1);
                cell.innerHTML = orden.orderAmountsMap[prod];
            }

            var dvTable = document.getElementById("dvTables");
            dvTable.appendChild(document.createElement("BR"));
            dvTable.appendChild(table);
        };


        var _constructActiveOrder = function () {
            var o = _getActiveOrder();
            var p = _constructProductsActiveOrder();
            return p + ',\"tableNumber\":' + o + '}';
        };

        var _getActiveOrder = function () {
            return document.getElementById("TableSel").value;
        };

        var _constructProductsActiveOrder = function () {
            var p = document.getElementById("Products");
            p = p.children;
            var str = '{\"orderAmountsMap\":{';
            for (var i = 0; i < p.length; i++) {
                if (i == p.length - 1) {
                    str += '\"' + p[i].children[0].children[0].value + '\":' + p[i].children[1].children[0].value + '}';
                } else {
                    str += '\"' + p[i].children[0].children[0].value + '\":' + p[i].children[1].children[0].value + ',';
                }
            }
            return str;

        };

        var updateOrder = function () {
            RestControllerModule.updateOrder(_constructActiveOrder(),
                {
                    onSuccess: function (response) {
                        window.alert("Order has been updated");
                        _getOrders(_noOpCallback());
                    },
                    onFailed: function (error) {
                        console.log(error);
                    }
                })
        };

        var deleteOrderItem = function (itemName) {
            document.getElementById(itemName).remove();
            updateOrder();
        };

        var addItemToOrder = function (orderId, item) {
            if (document.getElementById(item.nombre) != null) {
                document.getElementById(item.nombre).children[1].children[0].value = parseInt(document.getElementById(item.nombre).children[1].children[0].value, 10) + parseInt(item.cantidad, 10);
            } else {
                var productsRow = document.getElementById("Products");
                var row = document.createElement("div");
                row.className = "row mb-1";
                row.id = item.nombre;

                var col = document.createElement("div");
                col.className = "col-md-3";
                var inputProd = document.createElement("input");
                inputProd.type = "text";
                inputProd.className = "form-control";
                inputProd.value = item.nombre;

                col.appendChild(inputProd);
                row.appendChild(col);

                col = document.createElement("div");
                col.className = "col-md-3";
                var inputQuant = document.createElement("input");
                inputQuant.type = "text";
                inputQuant.className = "form-control";
                inputQuant.value = item.cantidad;

                col.appendChild(inputQuant);
                row.appendChild(col);

                col = document.createElement("div");
                col.className = "col-md-1";
                var buttonUpdate = document.createElement("button");
                buttonUpdate.onclick = function (ev) {
                    OrdersControllerModule.updateOrder()
                };
                buttonUpdate.className = "btn btn-primary";
                buttonUpdate.innerText = "Update";

                col.appendChild(buttonUpdate);
                row.appendChild(col);

                col = document.createElement("div");
                col.className = "col-md-1";
                var buttonDelete = document.createElement("button");
                buttonDelete.className = "btn btn-danger";
                buttonDelete.innerText = "Delete";
                buttonDelete.onclick = function (ev) {
                    OrdersControllerModule.deleteOrderItem(ev.currentTarget.parentNode.parentNode.id);
                };
                col.appendChild(buttonDelete);
                row.appendChild(col);
                productsRow.appendChild(row);
            }
            updateOrder();
        };

        var newItemConstructor = function () {
            var nombre = document.getElementById("newName").value;
            var cantidad = document.getElementById("newQuant").value;
            var newItem = {nombre: nombre, cantidad: cantidad};
            addItemToOrder(document.getElementById("TableSel").valueOf(), newItem);
        };

        var updateView = function () {
            var callback = {
                onSuccess: function () {
                    _populateUpdateView();
                },
                onFailed: function () {

                }
            };
            _getOrders(callback);
        };

        var _populateUpdateView = function () {
            var select = document.getElementById("TableSel");
            for (var i in orders) {
                var opt = document.createElement('option');
                opt.value = i;
                opt.innerText = "Table " + i;
                select.appendChild(opt);
            }
            changeOrderUpdate(select.value);
        };

        var changeOrderUpdate = function (tableNumber) {
            _deleteUpdateViewTable();
            var productsRow = document.getElementById("Products");
            for (var i in orders[tableNumber]["orderAmountsMap"]) {
                var row = document.createElement("div");
                row.className = "row mb-1";
                row.id = i;

                var col = document.createElement("div");
                col.className = "col-md-3";
                var inputProd = document.createElement("input");
                inputProd.type = "text";
                inputProd.className = "form-control";
                inputProd.value = i;

                col.appendChild(inputProd);
                row.appendChild(col);

                col = document.createElement("div");
                col.className = "col-md-3";
                var inputQuant = document.createElement("input");
                inputQuant.type = "text";
                inputQuant.className = "form-control";
                inputQuant.value = orders[tableNumber]["orderAmountsMap"][i];

                col.appendChild(inputQuant);
                row.appendChild(col);

                col = document.createElement("div");
                col.className = "col-md-1";
                var buttonUpdate = document.createElement("button");
                buttonUpdate.onclick = function (ev) {
                    OrdersControllerModule.updateOrder()
                };
                buttonUpdate.className = "btn btn-primary";
                buttonUpdate.innerText = "Update";

                col.appendChild(buttonUpdate);
                row.appendChild(col);

                col = document.createElement("div");
                col.className = "col-md-1";
                var buttonDelete = document.createElement("button");
                buttonDelete.className = "btn btn-danger";
                buttonDelete.innerText = "Delete";
                buttonDelete.onclick = function (ev) {
                    OrdersControllerModule.deleteOrderItem(ev.currentTarget.parentNode.parentNode.id);
                };
                col.appendChild(buttonDelete);
                row.appendChild(col);
                productsRow.appendChild(row);
            }
        };

        var _deleteUpdateViewTable = function () {
            var productsRow = document.getElementById("Products");
            while (productsRow.firstChild) {
                productsRow.removeChild(productsRow.firstChild);
            }
        };

        return {
            showOrdersByTable: showOrdersByTable,
            updateOrder: updateOrder,
            deleteOrderItem: deleteOrderItem,
            addItemToOrder: addItemToOrder,
            updateView: updateView,
            changeOrderUpdate: changeOrderUpdate,
            newItemConstructor: newItemConstructor
        };
    }
)
();