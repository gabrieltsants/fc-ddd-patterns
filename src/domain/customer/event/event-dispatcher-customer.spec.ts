import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerChangeAddressEvent from "./customer-change-address.event";
import CustomerCreatedEvent from "./customer-created.event";
import SendConsoleLogWhenCustomerChangeAddress from "./handler/send-console-log-when-customer-is-change-address.handler";
import SendConsoleLog1WhenCustomerCreatedHandler from "./handler/send-console-log1-when-customer-is-created.handler.ts";
import SendConsoleLog2WhenCustomerCreatedHandler from "./handler/send-console-log2-when-customer-is-created.handler";

describe("Domain events customer tests", () => {

    it("should notify customer created", () => {

        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendConsoleLog1WhenCustomerCreatedHandler();
        const eventHandler2 = new SendConsoleLog2WhenCustomerCreatedHandler();

        const spyEventHadler = jest.spyOn(eventHandler, "handle");
        const spyEventHadler2 = jest.spyOn(eventHandler2, "handle");

        eventDispatcher.register("CustomerCreatedEvent", eventHandler);
        eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

        expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandler);

        const customerCreatedEvent = new CustomerCreatedEvent({
            id: "123",
            name: "Customer 1",
            address: {
                street: "Street 1",
                number: 1,
                zip: "Zipcode 1",
                city: "City 1"
            }
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(spyEventHadler).toHaveBeenCalled();
        expect(spyEventHadler2).toHaveBeenCalled();

    });

    it("should notify when customer chnange address", () => {

        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendConsoleLogWhenCustomerChangeAddress();

        const spyEventHadler = jest.spyOn(eventHandler, "handle");

        eventDispatcher.register("CustomerChangeAddressEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"][0]).toMatchObject(eventHandler);

        const customerChangeAddressEvent = new CustomerChangeAddressEvent({
            id: "123",
            name: "Customer 1",
            address: {
                street: "Street 1",
                number: 1,
                zip: "Zipcode 1",
                city: "City 1"
            }
        });

        eventDispatcher.notify(customerChangeAddressEvent);

        expect(spyEventHadler).toHaveBeenCalled();

    });

})