import { SinonSandbox, SinonStatic, SinonStubbedInstance } from 'sinon';
import {
  ObjectLiteral,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  UpdateResult,
} from 'typeorm';

export class QueryBuilderStubber {
  _stubQueryBuilder<T extends ObjectLiteral>(
    sandbox: SinonStatic | SinonSandbox,
    stubs: T[],
    stubRaws: any[],
  ): SinonStubbedInstance<SelectQueryBuilder<T>> {
    const queryBuilderStub = sandbox.createStubInstance(SelectQueryBuilder);

    queryBuilderStub.select.returnsThis();
    queryBuilderStub.addSelect.returnsThis();

    queryBuilderStub.from.returnsThis();
    queryBuilderStub.addFrom.returnsThis();

    queryBuilderStub.where.returnsThis();
    queryBuilderStub.orWhere.returnsThis();
    queryBuilderStub.andWhere.returnsThis();

    queryBuilderStub.clone.returnsThis();
    queryBuilderStub.leftJoin.returnsThis();
    queryBuilderStub.leftJoinAndSelect.returnsThis();
    queryBuilderStub.leftJoinAndMapOne.returnsThis();
    queryBuilderStub.leftJoinAndMapMany.returnsThis();

    queryBuilderStub.orderBy.returnsThis();
    queryBuilderStub.addOrderBy.returnsThis();

    queryBuilderStub.skip.returnsThis();
    queryBuilderStub.take.returnsThis();

    queryBuilderStub.setParameter.returnsThis();

    queryBuilderStub.getOne.resolves(stubs[0]);
    queryBuilderStub.getOneOrFail.resolves(stubs[0]);
    queryBuilderStub.getMany.resolves(stubs);
    queryBuilderStub.getManyAndCount.resolves([stubs, stubs.length]);

    queryBuilderStub.getRawOne.resolves(stubRaws[0]);
    queryBuilderStub.getRawMany.resolves(stubRaws);
    queryBuilderStub.getRawAndEntities.resolves({
      entities: stubs,
      raw: stubRaws,
    });

    const updateQueryBuilderStub = this._stubUpdateQueryBuilder<T>(sandbox);
    queryBuilderStub.update.returns(updateQueryBuilderStub);

    return queryBuilderStub;
  }

  _stubUpdateQueryBuilder<T extends ObjectLiteral>(
    sandbox: SinonSandbox,
  ): SinonStubbedInstance<UpdateQueryBuilder<T>> {
    const updateQueryBuilderStub =
      sandbox.createStubInstance(UpdateQueryBuilder);

    updateQueryBuilderStub.set.returnsThis();
    updateQueryBuilderStub.where.returnsThis();
    updateQueryBuilderStub.andWhere.returnsThis();
    updateQueryBuilderStub.execute.resolves({ affected: 1 } as UpdateResult);

    return updateQueryBuilderStub;
  }
}
