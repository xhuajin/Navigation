export interface navToc {
  heading: string;
  level: number;
  children?: navToc[];
}

export class navToc {
  heading: string;
  level: number;
  children?: navToc[];
  constructor(heading: string, level: number) {
    this.heading = heading;
    this.level = level;
    this.children = new Array<navToc>();
  }
}