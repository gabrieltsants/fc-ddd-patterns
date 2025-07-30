import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("Should create an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it('Should find an order', async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address('Street 1', 300, 'Zipcode 1', 'City 1');
    const customer = new Customer('1', 'Customer 1');

    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product('1', 'Product 1', 100);

    await productRepository.create(product);
    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2
    );

    const orderRepository = new OrderRepository();
    const order = new Order('1', customer.id, [orderItem]);
    await orderRepository.create(order);
    const orderFound = await orderRepository.findOne(order.id);

    expect(orderFound).toStrictEqual(order);
  });

  it('Should find all orders', async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address('Street 1', 300, 'Zipcode 1', 'City 1');
    const customer = new Customer('1', 'Customer 1');

    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product('1', 'Product 1', 100);

    await productRepository.create(product);
    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2
    );

    const orderRepository = new OrderRepository();
    const order = new Order('1', customer.id, [orderItem]);
    await orderRepository.create(order);
    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(1);
    expect(orders[0]).toStrictEqual(order);
  });

  it('Should update an order', async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address('Street 1', 300, 'Zipcode 1', 'City 1');
    const customer = new Customer('1', 'Customer 1');

    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product1 = new Product('1', 'Product 1', 100);
    const product2 = new Product('2', 'Product 2', 50);

    await productRepository.create(product1);
    await productRepository.create(product2);

    const orderItem1 = new OrderItem(
      '1',
      product1.name,
      product1.price,
      product1.id,
      2
    );

    const orderRepository = new OrderRepository();
    const order = new Order('1', customer.id, [orderItem1]);
    await orderRepository.create(order);

    const orderItem2 = new OrderItem(
      '2',
      product2.name,
      product2.price,
      product2.id,
      3
    );
    order.items.push(orderItem2);

    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: '1',
      customer_id: '1',
      total: order.total(),
      items: [
        {
          id: orderItem1.id,
          name: orderItem1.name,
          price: orderItem1.price,
          product_id: orderItem1.productId,
          quantity: orderItem1.quantity,
          order_id: order.id,
        },
        {
          id: orderItem2.id,
          name: orderItem2.name,
          price: orderItem2.price,
          product_id: orderItem2.productId,
          quantity: orderItem2.quantity,
          order_id: order.id,
        },
      ],
    });
  });

  it('Should remove an order', async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address('Street 1', 300, 'Any zip code', 'City 1');
    const customer = new Customer('1', 'Customer 1');

    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product('1', 'Product 1', 100);

    await productRepository.create(product);
    const orderItem = new OrderItem(
      '1',
      product.name,
      product.price,
      product.id,
      2
    );

    const orderRepository = new OrderRepository();
    const order = new Order('1', customer.id, [orderItem]);
    await orderRepository.create(order);

    await orderRepository.remove(order.id);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
    });

    expect(orderModel).toBeNull();
  });
});
