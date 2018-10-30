/*
 * Copyright (C) 2016 Pivotal Software, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package edu.eci.arsw.myrestaurant.restcontrollers;

import edu.eci.arsw.myrestaurant.model.Order;
import edu.eci.arsw.myrestaurant.services.OrderServicesException;
import edu.eci.arsw.myrestaurant.services.RestaurantOrderServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author hcadavid
 */


@Service
@RestController
@RequestMapping(value = "/orders")
public class OrdersAPIController {

    @Autowired
    private RestaurantOrderServices rOS;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<?> manejadorGetRecursoOrdersAPI() {
        //obtener datos que se enviarán a través del API
        Set<Integer> set = rOS.getTablesWithOrders();
        Map<Integer, Order> mapOrders = new ConcurrentHashMap<>();
        for (Integer i : set) {
            mapOrders.put(i, rOS.getTableOrder(i));
        }
        return new ResponseEntity<>(mapOrders, HttpStatus.ACCEPTED);
    }

    @RequestMapping(value = "/{idmesa}")
    public ResponseEntity<?> manejadorGetOrder(@PathVariable int idmesa) {
        //obtener datos que se enviarán a través del API
        Map<Integer, Order> mapOrders = new ConcurrentHashMap<>();
        Order o = rOS.getTableOrder(idmesa);
        if (o != null) {
            mapOrders.put(idmesa, o);
            return new ResponseEntity<>(mapOrders, HttpStatus.ACCEPTED);
        } else {
            return new ResponseEntity<>("Table doesn't exist or doesn't have an order associate", HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> manejadorPostRecursoOrder(@RequestBody Order o) {
        try {
            //registrar dato
            rOS.addNewOrderToTable(o);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (OrderServicesException ex) {
            Logger.getLogger(OrdersAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("An error creating the order has been produced", HttpStatus.FORBIDDEN);
        }
    }

    @RequestMapping(value = "/{idmesa}/total")
    public ResponseEntity<?> manejadorGetOrderTotal(@PathVariable int idmesa) {
        try {
            //obtener datos que se enviarán a través del API
            return new ResponseEntity<>(rOS.calculateTableBill(idmesa), HttpStatus.ACCEPTED);
        } catch (OrderServicesException ex) {
            Logger.getLogger(OrdersAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Table doesn't exist or doesn't have an order associate", HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(method = RequestMethod.PUT)
    public ResponseEntity<?> manejadorPutRecursoOrder(@RequestBody Order o) {
        //registrar dato
        try {
            rOS.releaseTable(o.getTableNumber());
            rOS.addNewOrderToTable(o);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (OrderServicesException e) {
            try {
                rOS.addNewOrderToTable(o);
                return new ResponseEntity<>(HttpStatus.CREATED);
            } catch (OrderServicesException e1) {
                Logger.getLogger(OrdersAPIController.class.getName()).log(Level.SEVERE, null, e);
                return new ResponseEntity<>("Table doesn't exist or doesn't have an order associate", HttpStatus.NOT_FOUND);
            }
        }
    }

    @RequestMapping(value = "/{idmesa}", method = RequestMethod.PUT)
    public ResponseEntity<?> manejadorPutRecursoProduct(@RequestBody Map<String, Integer> p, @PathVariable Integer idmesa) {
        try {
            //registrar dato
            Set<String> productos = p.keySet();
            Order order = rOS.getTableOrder(idmesa);
            if (order != null) {
                for (String i : productos) {
                    rOS.getProductByName(i);
                }
                for (String i : productos) {
                    order.addDish(i, p.get(i));
                }
                return new ResponseEntity<>(HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Table doesn't exist or doesn't have an order associate", HttpStatus.NOT_FOUND);
            }
        } catch (OrderServicesException e) {
            Logger.getLogger(OrdersAPIController.class.getName()).log(Level.SEVERE, null, e);
            return new ResponseEntity<>("Product doesn't exist", HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(method = RequestMethod.DELETE, value = "/{idmesa}")
    public ResponseEntity<?> manejadorDeleteRecursoOrder(@PathVariable Integer idmesa) {
        try {
            rOS.releaseTable(idmesa);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (OrderServicesException ex) {
            Logger.getLogger(OrdersAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return new ResponseEntity<>("Table doesn't exist or doesn't have an order associate", HttpStatus.NOT_FOUND);
        }
    }


}