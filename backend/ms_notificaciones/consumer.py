import json
from kafka import KafkaConsumer

KAFKA_BROKER_URL = "localhost:9092"
KAFKA_TOPIC_USUARIOS_CREADOS = "usuarios.creados"


def main():
    print("[KAFKA] Conectando a localhost:9092 ...")

    consumer = KafkaConsumer(
        KAFKA_TOPIC_USUARIOS_CREADOS,
        bootstrap_servers=KAFKA_BROKER_URL,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        group_id="ms_notificaciones",
        auto_offset_reset="earliest",
        enable_auto_commit=True,
    )

    print(
        f"[KAFKA] Consumer conectado. Escuchando tópico '{KAFKA_TOPIC_USUARIOS_CREADOS}'..."
    )

    for message in consumer:
        data = message.value
        print("[KAFKA] Mensaje recibido:", data)
        print("========= [NOTIFICACIÓN] =========")
        print("Usuario creado, debería mandarse un correo:")
        print(json.dumps(data, indent=4, ensure_ascii=False))
        print("==================================\n")


if __name__ == "__main__":
    main()
