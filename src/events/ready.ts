import Client from "../structures/Client";
import logger from "../util/Logger";

export default function ready(client: Client) {
  logger.info("Ready");
}
