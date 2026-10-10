import type { Specialization } from '../contract/model/index.js';
import { seededRandom } from '../common/cat.ts';
import type { LiveFamily } from './live-bank.ts';

type Draw = (min: number, max: number) => number;
type Generator = (draw: Draw) => { parameters: Record<string, number>; prompt: string; value: number; tolerance?: number };

function family(spec: Specialization, key: string, title: string, competency: string, b: number, generate: Generator): LiveFamily {
  return { id: `canary-${spec}-${key}`, title, competency, a: 1.2, b, c: 0, canary: true,
    specializations: [spec], skillIds: [], templateVersion: 1, calibration: 'expert_prior',
    generate(seed) {
      const random = seededRandom(seed);
      return generate((min, max) => min + Math.floor(random() * (max - min + 1)));
    } };
}

export const canaryFamilies: readonly LiveFamily[] = [
  family('backend', 'queue', 'Обработка очереди', 'systems', -0.8, n => {
    const jobs = n(400, 5000), workers = n(4, 16), duration = n(20, 250);
    return { parameters: { jobs, workers, duration }, prompt: `В очереди ${jobs} задач. ${workers} одинаковых worker одновременно начинают обработку. Каждая задача занимает ровно ${duration} мс, worker берёт следующую сразу после завершения. Накладных расходов нет. Через сколько миллисекунд завершатся все задачи?`, value: Math.ceil(jobs / workers) * duration };
  }),
  family('backend', 'replication', 'Объём репликации', 'databases', 0.8, n => {
    const transactions = n(1000, 20000), payload = n(100, 900), overhead = n(16, 64), replicas = n(2, 5);
    return { parameters: { transactions, payload, overhead, replicas }, prompt: `${transactions} транзакций создают по ${payload} байт WAL плюс ${overhead} байт служебных данных на транзакцию. Полный поток отправляется каждой из ${replicas} реплик один раз. Сжатия и повторов нет. Сколько байт суммарно отправлено репликам?`, value: transactions * (payload + overhead) * replicas };
  }),
  family('frontend', 'canvas', 'Буфер canvas', 'interface', -0.8, n => {
    const width = n(200, 900), height = n(200, 900), dpr = n(2, 4);
    return { parameters: { width, height, dpr }, prompt: `Canvas имеет CSS-размер ${width} × ${height} px. Ширина и высота backing store умножены на devicePixelRatio=${dpr}. Один RGBA-пиксель занимает 4 байта. Сколько байт занимает один буфер без служебных данных?`, value: width * height * dpr ** 2 * 4 };
  }),
  family('frontend', 'grid', 'Высота сетки', 'interface', 0.8, n => {
    const cards = n(400, 4000), columns = n(3, 8), height = n(80, 260), gap = n(8, 24);
    const rows = Math.ceil(cards / columns);
    return { parameters: { cards, columns, height, gap }, prompt: `CSS Grid содержит ${cards} карточек в ${columns} колонках. Все карточки высотой ${height}px, row-gap=${gap}px. Карточки заполняются по строкам, padding и border отсутствуют. Какова полная высота сетки в px?`, value: rows * height + (rows - 1) * gap };
  }),
  family('mobile', 'sync', 'Время синхронизации', 'systems', -0.8, n => {
    const records = n(500, 6000), batch = n(20, 100), latency = n(40, 180), processing = n(5, 30);
    return { parameters: { records, batch, latency, processing }, prompt: `Мобильное приложение отправляет ${records} записей последовательными пакетами не более ${batch} записей. Каждый запрос, включая неполный последний, занимает ${latency} мс сети и ${processing} мс обработки. Перекрытия запросов нет. Сколько миллисекунд займёт синхронизация?`, value: Math.ceil(records / batch) * (latency + processing) };
  }),
  family('mobile', 'stride', 'Память изображения', 'interface', 0.8, n => {
    const width = n(200, 1200), height = n(200, 1200), alignment = n(1, 4) * 4;
    return { parameters: { width, height, alignment }, prompt: `RGB-изображение ${width} × ${height} пикселей имеет 3 байта на пиксель. Длина каждой строки в памяти округляется вверх до кратного ${alignment} байтам. Служебных данных нет. Сколько байт занимает изображение?`, value: Math.ceil(width * 3 / alignment) * alignment * height };
  }),
  family('qa', 'retries', 'Число запусков тестов', 'quality', -0.8, n => {
    const cases = n(1000, 12000), failed = n(100, 900), retries = n(2, 5);
    return { parameters: { cases, failed, retries }, prompt: `Из ${cases} автотестов ${failed} стабильно падают, остальные проходят с первой попытки. Каждый падающий тест запускается повторно ещё ${retries} раз и продолжает падать. Сколько отдельных запусков тестов будет выполнено?`, value: cases + failed * retries };
  }),
  family('qa', 'load', 'Успешные запросы', 'quality', 0.8, n => {
    const clients = n(30, 180), requests = n(100, 900), failed = n(5, 80);
    return { parameters: { clients, requests, failed }, prompt: `${clients} клиентов нагрузочного теста отправили по ${requests} запросов. У каждого клиента ровно ${failed} запросов завершились ошибкой, остальные успешны. Повторов нет. Сколько успешных запросов всего?`, value: clients * (requests - failed) };
  }),
  family('devops', 'retention', 'Объём хранения логов', 'systems', -0.8, n => {
    const daily = n(500, 9000), days = n(7, 30), replicas = n(2, 4);
    return { parameters: { daily, days, replicas }, prompt: `За сутки сервис создаёт ${daily} MiB логов. Хранятся ровно ${days} полных суток, всего ${replicas} одинаковых копии каждого файла. Сжатия и служебных расходов нет. Каков общий объём в MiB?`, value: daily * days * replicas };
  }),
  family('devops', 'rollout', 'Пиковый запрос CPU', 'systems', 0.8, n => {
    const replicas = n(10, 70), surge = n(2, 12), cpu = n(100, 900);
    return { parameters: { replicas, surge, cpu }, prompt: `Deployment имеет ${replicas} реплик, maxSurge=${surge} задан целым числом. В момент пика rollout одновременно существуют все старые реплики и ${surge} новых. У каждой CPU request ${cpu} millicores. Сколько millicores суммарно запрошено в этот момент?`, value: (replicas + surge) * cpu };
  }),
  family('data_ml', 'f1', 'F1 классификатора', 'data_reasoning', -0.8, n => {
    const tp = n(100, 900), fp = n(20, 200), fn = n(20, 200);
    return { parameters: { tp, fp, fn }, prompt: `Бинарный классификатор: TP=${tp}, FP=${fp}, FN=${fn}. Чему равен F1 положительного класса в процентах? Округлите до двух знаков после запятой.`, value: Math.round(10000 * 2 * tp / (2 * tp + fp + fn)) / 100, tolerance: 0.005 };
  }),
  family('data_ml', 'split', 'Размер обучающей выборки', 'data_reasoning', 0.8, n => {
    const groups = n(200, 2000), size = n(5, 40), validation = n(20, 80), test = n(20, 80);
    return { parameters: { groups, size, validation, test }, prompt: `Датасет содержит ${groups} непересекающихся групп по ${size} строк. В validation полностью отложены ${validation} групп, в test — ещё ${test} других групп. Остальные группы используются для обучения. Сколько строк в train?`, value: (groups - validation - test) * size };
  }),
  family('analyst', 'revenue', 'Чистая выручка', 'data_reasoning', -0.8, n => {
    const orders = n(300, 3000), returned = n(20, 200), price = n(100, 900), fee = n(5, 40);
    return { parameters: { orders, returned, price, fee }, prompt: `Продано ${orders} заказов по ${price} ₽. ${returned} заказов полностью возвращены. За каждый оставшийся заказ удерживается комиссия ${fee} ₽, за возвращённые комиссия нулевая. Какова выручка после возвратов и комиссий в рублях?`, value: (orders - returned) * (price - fee) };
  }),
  family('analyst', 'weighted', 'Средний чек', 'data_reasoning', 0.8, n => {
    const first = n(100, 900), second = n(100, 900), priceA = n(100, 2000), priceB = n(100, 2000);
    return { parameters: { first, second, priceA, priceB }, prompt: `В первом сегменте ${first} заказов со средним чеком ${priceA} ₽, во втором ${second} заказов со средним чеком ${priceB} ₽. Каков средний чек всех заказов? Округлите до двух знаков после запятой.`, value: Math.round((first * priceA + second * priceB) / (first + second) * 100) / 100, tolerance: 0.005 };
  }),
];
