import type { Specialization, TestItem } from '../contract/model/index.js';
import { seededRandom, type Family } from '../common/cat.ts';
import type { ExpectedAnswer } from './grading.ts';

interface Variant { parameters: Record<string, number>; prompt: string; value: number; tolerance?: number }
export const LIVE_BANK_VERSION = 'expert-bank-20261010-v1';
export interface LiveFamily extends Family {
  title: string;
  specializations: readonly Specialization[];
  skillIds: readonly string[];
  templateVersion: number;
  calibration: 'expert_prior';
  generate: (seed: number) => Variant;
}
const all: readonly Specialization[] = ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'];
const draw = (seed: number) => {
  const random = seededRandom(seed);
  return (from: number, to: number) => from + Math.floor(random() * (to - from + 1));
};
function family(id: string, title: string, competency: string, b: number, specializations: readonly Specialization[], generate: LiveFamily['generate'], skillIds: readonly string[] = []): LiveFamily {
  return { id, title, competency, a: 1.2, b, specializations, skillIds, templateVersion: 1, calibration: 'expert_prior', generate };
}

/** Versioned parameterized objective families. These priors are NOT empirical calibration. */
export const LIVE_BANK: readonly LiveFamily[] = [
  family('live-sql-count-null', 'COUNT и NULL', 'databases', -1, ['backend', 'qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), rows = n(20, 200), nulls = n(1, rows - 1);
    return { parameters: { rows, nulls }, prompt: `В таблице ${rows} строк. В ${nulls} строках поле value равно NULL, в остальных содержит число. Что вернёт SELECT COUNT(value) FROM events?`, value: rows - nulls };
  }, ['postgresql']),
  family('live-sql-join-multiplicity', 'Размер результата JOIN', 'databases', 0.4, ['backend', 'qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), a = n(2, 9), b = n(2, 8), c = n(1, 7), d = n(1, 6);
    return { parameters: { a, b, c, d }, prompt: `INNER JOIN по key: в левой таблице ${a} строк с key=1 и ${c} с key=2; в правой ${b} с key=1 и ${d} с key=2. Других строк нет. Сколько строк в результате?`, value: a * b + c * d };
  }, ['postgresql']),
  family('live-queue-drain', 'Время опустошения очереди', 'systems', -0.4, all, seed => {
    const n = draw(seed), backlog = n(50, 500), input = n(1, 20), output = input + n(1, 15);
    return { parameters: { backlog, input, output }, prompt: `Очередь содержит ${backlog} задач. За каждую секунду сначала приходит ${input} задач, затем обработчик завершает до ${output}. Сколько целых секунд нужно до первого опустошения очереди?`, value: Math.ceil(backlog / (output - input)) };
  }),
  family('live-token-bucket', 'Ограничитель token bucket', 'systems', 0.6, ['backend', 'frontend', 'mobile', 'qa', 'devops'], seed => {
    const n = draw(seed), capacity = n(10, 40), tokens = n(0, capacity), rate = n(1, 8), seconds = n(1, 8), requests = n(5, 60);
    return { parameters: { capacity, tokens, rate, seconds, requests }, prompt: `Token bucket: ёмкость ${capacity}, сейчас ${tokens} токенов, пополнение ${rate}/с. Запросов нет ${seconds} секунд, затем одновременно поступает ${requests} запросов по одному токену. Сколько запросов будут допущены?`, value: Math.min(requests, capacity, tokens + rate * seconds) };
  }),
  family('live-ci-critical-path', 'Критический путь CI', 'systems', -0.2, all, seed => {
    const n = draw(seed), setup = n(1, 8), tests = n(3, 15), build = n(3, 15), deploy = n(1, 6);
    return { parameters: { setup, tests, build, deploy }, prompt: `CI: подготовка ${setup} минут. После неё тесты (${tests} минут) и сборка (${build} минут) идут параллельно. Деплой (${deploy} минут) начинается после обеих задач. Ресурсы не ограничены. Через сколько минут всё завершится?`, value: setup + Math.max(tests, build) + deploy };
  }),
  family('live-test-cartesian', 'Полное покрытие конфигураций', 'quality', -0.8, all, seed => {
    const n = draw(seed), browsers = n(2, 5), platforms = n(2, 4), roles = n(2, 5);
    return { parameters: { browsers, platforms, roles }, prompt: `Проверяются все комбинации ${browsers} браузеров, ${platforms} платформ и ${roles} ролей. Один тест покрывает ровно одну комбинацию. Сколько тестов нужно для полного, а не попарного покрытия?`, value: browsers * platforms * roles };
  }),
  family('live-inclusive-boundaries', 'Граничные значения диапазона', 'quality', -1.2, all, seed => {
    const n = draw(seed), low = n(1, 50), high = low + n(5, 60);
    return { parameters: { low, high }, prompt: `Валидация принимает целые x при ${low} <= x <= ${high}. Сколько различных целых значений допустимо?`, value: high - low + 1 };
  }),
  family('live-slo-budget', 'Бюджет недоступности', 'systems', 0.3, ['backend', 'qa', 'devops', 'analyst'], seed => {
    const n = draw(seed), days = n(7, 30), permittedTenthsPercent = n(1, 9);
    const availability = 100 - permittedTenthsPercent / 10;
    return { parameters: { days, permittedTenthsPercent }, prompt: `SLO доступности ${availability.toFixed(1)}% за ${days} суток (сутки = 24 часа). Какой бюджет недоступности в минутах? Ответ округлите до двух знаков после запятой.`, value: days * 1440 * permittedTenthsPercent / 1000, tolerance: 0.00500001 };
  }),
  family('live-weighted-mean', 'Объединение средних', 'data_reasoning', 0, all, seed => {
    const n = draw(seed), firstCount = n(2, 10), secondCount = n(2, 10), firstMean = n(10, 90), secondMean = n(10, 90);
    return { parameters: { firstCount, secondCount, firstMean, secondMean }, prompt: `В первой группе ${firstCount} наблюдений со средним ${firstMean}, во второй ${secondCount} со средним ${secondMean}. Чему равно среднее объединённой выборки? Округлите до двух знаков.`, value: (firstCount * firstMean + secondCount * secondMean) / (firstCount + secondCount), tolerance: 0.00500001 };
  }),
  family('live-f1-score', 'F1 по матрице ошибок', 'data_reasoning', 0.8, ['qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), tp = n(10, 70), fp = n(1, 30), fn = n(1, 30);
    return { parameters: { tp, fp, fn }, prompt: `Бинарный классификатор: TP=${tp}, FP=${fp}, FN=${fn}. Вычислите F1 положительного класса в процентах. Округлите до двух знаков.`, value: 200 * tp / (2 * tp + fp + fn), tolerance: 0.00500001 };
  }),
  family('live-loop-pairs', 'Число итераций вложенного цикла', 'algorithms', 0.2, all, seed => {
    const n = draw(seed), size = n(5, 60);
    return { parameters: { size }, prompt: `Внешний цикл перебирает i от 0 до ${size - 1} включительно. Внутренний перебирает j от 0 до i-1 включительно (при i=0 не выполняется). Сколько раз выполнится тело внутреннего цикла?`, value: size * (size - 1) / 2 };
  }),
  family('live-binary-tree-height', 'Высота полного дерева', 'algorithms', 0.5, ['backend', 'frontend', 'mobile', 'qa', 'data_ml'], seed => {
    const n = draw(seed), levels = n(3, 12), nodes = 2 ** levels - 1;
    return { parameters: { levels, nodes }, prompt: `Полное бинарное дерево содержит ${nodes} узлов; каждый уровень полностью заполнен. Сколько уровней, если корень — первый уровень?`, value: levels };
  }),
  family('live-css-box-width', 'Ширина CSS box model', 'interface', -0.1, ['frontend', 'qa'], seed => {
    const n = draw(seed), width = n(100, 400), padding = n(5, 25), border = n(1, 5), borderBox = n(0, 1);
    return { parameters: { width, padding, border, borderBox }, prompt: `CSS: width:${width}px; padding:${padding}px; border:${border}px solid; box-sizing:${borderBox ? 'border-box' : 'content-box'}. margin:0, min/max-width не заданы. Какова внешняя ширина элемента в px, включая padding и border?`, value: borderBox ? width : width + 2 * (padding + border) };
  }),
  family('live-mobile-density', 'Преобразование dp в px', 'interface', -0.5, ['mobile', 'frontend', 'qa'], seed => {
    const n = draw(seed), dp = n(10, 100), density = n(1, 4);
    return { parameters: { dp, density }, prompt: `Масштаб экрана ${density} px на 1 dp. Элемент шириной ${dp} dp. Какова ширина в физических пикселях?`, value: dp * density };
  }),
  family('live-worker-batches', 'Пакетная обработка', 'systems', -0.3, ['backend', 'mobile', 'qa', 'devops'], seed => {
    const n = draw(seed), requests = n(20, 100), workers = n(2, 10), duration = n(2, 9);
    return { parameters: { requests, workers, duration }, prompt: `${requests} задач готовы в момент 0. Есть ${workers} одинаковых worker, каждый обрабатывает одну задачу за ${duration} секунд без накладных расходов. Каково минимальное время до завершения всех задач в секундах?`, value: Math.ceil(requests / workers) * duration };
  }),
];

export function instantiate(family: LiveFamily, seed: number, id: string, index: number) {
  if (!Number.isInteger(seed) || !Number.isInteger(index) || index < 1) throw new RangeError('Invalid instance parameters');
  const variant = family.generate(seed);
  const ordered = [...LIVE_BANK].sort((a, b) => a.b - b.b || a.id.localeCompare(b.id));
  if (!ordered.some(f => f.id === family.id)) throw new RangeError('Unknown live family');
  const difficulty = Math.min(5, 1 + Math.floor(ordered.findIndex(f => f.id === family.id) / ordered.length * 5));
  const publicItem: TestItem = { instance_id: id, index, block: 'adaptive', type: 'short_answer',
    competency: { id: family.competency, name: ({ databases: 'Базы данных', systems: 'Системы и инфраструктура', quality: 'Качество и тестирование', data_reasoning: 'Работа с данными', algorithms: 'Алгоритмы', interface: 'Интерфейсы' } as Record<string, string>)[family.competency] ?? family.competency }, difficulty_level: difficulty,
    title: family.title, prompt: variant.prompt, code: null, options: null, answer_language: null, starter_code: null, max_length: 100, public_tests: null };
  const expectedAnswer: ExpectedAnswer = { kind: 'numeric', value: variant.value, absoluteTolerance: variant.tolerance ?? 0, relativeTolerance: 0 };
  return { familyId: family.id, templateVersion: family.templateVersion, parameters: { seed, ...variant.parameters }, publicItem, expectedAnswer, discrimination: family.a, difficulty: family.b };
}

/** Necessary inventory bound only: it does not prove content balance or measured exposure. */
export function bankInventory(specialization: Specialization, maxItems: number, exposureCeiling: number) {
  if (!Number.isInteger(maxItems) || maxItems < 1 || !Number.isFinite(exposureCeiling) || exposureCeiling <= 0 || exposureCeiling > 1) throw new RangeError('Invalid bank policy');
  const available = LIVE_BANK.filter(f => f.specializations.includes(specialization));
  const required = Math.ceil(maxItems / exposureCeiling);
  return { available: available.length, required, deficit: Math.max(0, required - available.length), sufficientInventory: available.length >= required };
}
