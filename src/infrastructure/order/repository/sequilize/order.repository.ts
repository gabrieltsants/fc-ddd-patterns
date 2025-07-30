import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const sequelize = OrderModel.sequelize!;
    await sequelize.transaction(async (t) => {
      await OrderModel.update(
        {
          customer_id: entity.customerId,
          total: entity.total(),
        },
        {
          where: { id: entity.id },
          transaction: t,
        }
      );

      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction: t,
      });

      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      }));

      await OrderItemModel.bulkCreate(items, { transaction: t });
    });
  }


  async findOne(orderId: string): Promise<Order | null> {
    const order = await OrderModel.findOne({
      where: { id: orderId },
      include: ['items'],
    });
    if (!orderId) return null;

    const items = order.items.map(
      (item) =>
        new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity,
        )
    );

    return new Order(order.id, order.customer_id, items);
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.findAll({
      include: ['items'],
    });

    const [items] = orders.map((order) =>
      order.items.map(
        (item) =>
          new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity,
          )
      )
    );

    return orders.map((order) => new Order(order.id, order.customer_id, items));
  }

  async remove(orderId: string): Promise<void> {
    await OrderModel.destroy({ where: { id: orderId } });
  }
}
