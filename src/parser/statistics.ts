import { ParseResult } from './models/parse-result';

interface Statistic {
  elementType: string;
  existingIds: number;
  newIds: number;
  totalIds: number;
  collisions: number;
}

export class StatisticsService {
  static INSTANCE: StatisticsService = new StatisticsService();
  statistics: Map<string, Statistic[]> = new Map();

  constructor() {}

  static getInstance(): StatisticsService {
    return StatisticsService.INSTANCE;
  }

  addStatistic(filename: string, elementType: string, result: ParseResult[]): void {
    let totalIds = result.length;

    if (totalIds === 0) {
      return;
    }
    const statistics = this.statistics.get(filename);

    const collisions = result.filter(r => r.collision).length;
    const existingIds = result.filter(r => r.existing).length;
    const newIds = totalIds - existingIds;

    const stat = {
      elementType,
      existingIds,
      newIds,
      totalIds,
      collisions
    };

    if (statistics) {
      statistics.push(stat);
    } else {
      this.statistics.set(filename, [stat]);
    }
  }

  printStatistic(): void {
    console.log('####################################');
    console.log('########     STATISTICS     ########');
    console.log('####################################');
    console.log('');

    this.statistics.forEach((value, key) => {
      console.log(`"${key}": [`);
      value.forEach(v => console.log(`${JSON.stringify(v, null, 2)},`));
      console.log(']');
      console.log('');
    });

    this.printSummary();
  }

  printSummary(): void {
    const allResults: Statistic[] = Array.from(this.statistics.values()).reduce((prev, curr) => prev.concat(curr));
    const total: Partial<Statistic> = {
      existingIds: allResults.reduce((prev, curr) => prev + curr.existingIds, 0),
      newIds: allResults.reduce((prev, curr) => prev + curr.newIds, 0),
      totalIds: allResults.reduce((prev, curr) => prev + curr.totalIds, 0),
      collisions: allResults.reduce((prev, curr) => prev + curr.collisions, 0)
    };
    const toFixedWith = (val: number = 0) => ('' + val).padStart(6, ' ');
    const toPercent = (dividend: number = 0, divisor: number = 1) => ((dividend / divisor) * 100).toFixed(0);

    console.log(`SUMMARY - TOTAL`);
    console.log(`  Files processed: ${toFixedWith(this.statistics.size)}`);
    console.log(`  Ids (abs. num.)`);
    console.log(`    - existing   : ${toFixedWith(total.existingIds)}  (${toPercent(total.existingIds, total.totalIds)}%)`);
    console.log(`    - new        : ${toFixedWith(total.newIds)}  (${toPercent(total.newIds, total.totalIds)}%)`);
    console.log(`    - total      : ${toFixedWith(total.totalIds)}`);
    console.log(`    - collisions : ${toFixedWith(total.collisions)}`);
    console.log('');
  }
}
