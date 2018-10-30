package edu.eci.arsw.myrestaurant.test;

import edu.eci.arsw.myrestaurant.beans.BillCalculator;
import edu.eci.arsw.myrestaurant.model.Order;
import edu.eci.arsw.myrestaurant.services.OrderServicesException;
import edu.eci.arsw.myrestaurant.services.RestaurantOrderServicesStub;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest()
public class ApplicationServicesTests {

    @Autowired
    RestaurantOrderServicesStub ros;

    @Test
    public void contextLoads() throws OrderServicesException{

    }
    
    /**
     * Debe calcular correctamente la cuenta de la mesa 3
     * @throws OrderServicesException 
     */
    @Test
    public void calculaCorrectamente() throws OrderServicesException{
        int valor;
        valor = ros.calculateTableBill(3);
        //El valor esperado es 24600+24600*0.19+2600+2600*0.16 = 32290
        float fesperado = (2*12300)+(2*12300*0.19f)+(2*1300)+(2*1300*0.16f);
        int esperado = (int) fesperado;
        org.junit.Assert.assertEquals(esperado, valor);
    }
    
    /**
     * Se genera una excepcion si se trata de consultar una mesa que no existe
     * @throws OrderServicesException 
     */
    @Test
    public void debeDarErrorConMesaNoExistente() throws OrderServicesException{
        int valor;
        try{
            valor = ros.calculateTableBill(2);
            //No debe pasar de este puto
            org.junit.Assert.fail();
        }catch(OrderServicesException e){
            org.junit.Assert.assertTrue("Debe generar excepcion", true);
        }       
    }
}
