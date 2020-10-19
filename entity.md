# @ngrx/entity

- 저장 컬렉션을 위한 Entity State Adapter
- Entity는 entity 컬렉션을 조작하고 쿼리를 날리는 API를 제공합니다.
  - 모델들을 관리하는 리듀서를 만듦으로써 boilerplate를 줄입니다.
  - entity 컬렉션을 관리할 수 있게 CRUD operation 수행을 제공합니다.
  - entity 정보를 select 하기위한 확장가능한 type-safe adapter입니다.

## 설치

### npm을 이용한 설치

```bash
    npm install @ngrx/entity --save
```

### yarn을 이용한 설치

```bash
    yarn add @ngrx/entity
```

### ng add을 이용한 설치

- 프로젝트가 Angular CLI 6+를 사용한다면 다음과 같이 설치합니다.

```bash
    ng add @ngrx/entity@latest
```

- 이 명령은 다음의 단계를 자동으로 해줍니다.
  1. package.json>dependencies에 @ngrx/entity를 업데이트 합니다.
  2. 위의 디펜던시들을 설치할 npm install을 실행합니다.

## Entity와 클래스 인스턴스들

엔티티는 컬렉션을 관리할때 plain Javascript의 사용을 촉진합니다. es6의 클래스 인스턴스는 컬렉션에서 엔티티들이 관리가 될 때 plain Js object로 변환이 될 것입니다.

1. 상태에 포함된 데이터 구조에 로직을 포함하지 않을 것을 확실히 하세요, 그러면 그들끼리 복제될 확률이 줄어들 것입니다.
2. 상태는 로컬스토리지 같은 브라우저 스토리지 매커니즘으로부터 저장되고, rehydrate 되도록 항상 열거가능할 것입니다.
3. 상태는 redux devtool을 사용해 확인할 수 있습니다.

## Entity Interfaces

### EntityState<T>

EntityState는 주어진 entity 컬렉션을 위한 미리정의된 제네릭 인터페이스입니다.

```javascript
interface EntityState<V> {
  ids: string[] | number[];
  entities: { [id: string | id: number]: V };
}
```

- ids : 컬렉션안에서 주요 id들의 배열.
- entities :  주요 id로 인덱싱되는 엔티티들의 딕셔너리.

사용 예) user.reducer.ts

```javascript
export interface User {
  id: string;
  name: string;
}

export interface State extends EntityState<User> {
  // additional entity state properties
  selectedUserId: number | null;
}
```

### EntityAdapter<T>

제공된 엔티티 어뎁터를 위한 타입 인터페이스를 제공합니다. 엔티티 어뎁터는 엔티티 상대를 관리하기 위한 많은 컬렉션 메소드들을 제공합니다.

사용예) user.reducer.ts

```javascript
export const adapter: EntityAdapter<User> = createEntityAdapter<User>();
```

## Entity Adapter

### createEntityAdapter<T>

싱글 엔티티 상태 컬렉션을 위한 제네릭 엔티티 어뎁터를 리턴하는 메소드입니다.

반환된 어뎁터는 컬렉션 타입을 고려한 기능을 수행하기 위한 많은 어뎁터 메소드들을 제공합니다.

- selectedId : 컬렉션을 위한 주요 id를 select하기 위한 메소드 입니다.
  엔티티가 primary key 인 id를 가질 때 선택적으로 사용할 수 있습니다.

- sortComparer : 컬렉션을 정렬하는 데 사용하는 비교 함수 입니다. 비교함수는 보여지기 전에 컬렉션이 정렬이 되야할 때 필요합니다. crud 기능을 수행하는 동안에 더 효과적인 컬렉션을 정렬하지 않은 상태로 두고 싶다면 false로 설정하면 됩니다.

사용 예) user.reducer.ts

```javascript
import { EntityState, EntityAdapter, createEntityAdapter } from "@ngrx/entity";

export interface User {
  id: string;
  name: string;
}

export interface State extends EntityState<User> {
  selectedUserId: number;
}

export function selectUserId(a: User): string {
  //In this case this would be optional since primary key is id
  return a.id;
}
export function sortByName(a: User, b: User): number {
  return a.name.localeCompare(b.name);
}
<!-- prettier-ignore -->
export const adapter: EntityAdapter<User> =createEntityAdapter<User>({
    selectedId: selectUserId,
    sortComparer: sortByName,
  });
```

### Adapter Methods

이러한 메소드들은 createEntityAdapter를 사용할 때 어뎁터 객체가 리턴한 것에서 제공됩니다.

메소드들은 주어진 액션에 기반한 엔티티 커렉션을 관리하는 리듀서 함수에서 사용되어집니다.

#### getInitialState

주어진 타입을 기반으로 엔티티를 위한 initialState를 반환해줍니다. 추가적인 상태도 주어진 configuration object를 통해 제공됩니다. initialState는 리듀서 함수에 사용합니다.

사용 예) user.reducer.ts

```javascript
import { Action, createReducer } from "@ngrx/store";
import { EntityState, EntityAdapter, createEntityAdapter } from "@ngrx/entity";

export interface User {
  id: string;
  name: string;
}
export interface State extends EntityState<User> {
  //additional entities state properties
  selectedUserId: number | null;
}

export const initialState: State = adapter.getInitialState({
  //additional entity state properties
  selectedUserId: null,
});

const userReducer = createReducer(initialState);

export function reducer(state: State | undefined, action: Action) {
  return userReducer(state, action);
}
```

### Adapter Collection 메소드들

엔티티 어뎁터는 엔티티를 고려한 기능들을 위한 메소드들도 제공합니다. 이 메소드들은 한번에 많은 저장 된 것들을 바꿀 수 있습니다. 각각의 메소드들은 만약 변화가 일어났으면 새로 수정된 상태를, 만약 아무 변화도 일어나지 않았다면 동일한 상태를 반환합니다.

- addOne : 컬렉션에 하나의 엔티티 추가
- addMany : 여러개의 엔티티 추가
- setAll : 현재의 컬렉션을 제공된 컬렉션으로 대체
- setOne : 하나의 엔티티를 추가하거나 대체
- removeOne : 하나의 엔티티를 삭제
- removeMany : 많은 엔티티를 컬렉션으로부터 삭제 , id 또는 선언된 것으로
- removeAll : 엔티티 컬렉션을 클리어.
- updateOne : 컬렉션 안의 하나의 엔티티를 업데이트. 부분적인 업데이트를 지원.
- updateMany : 컬렉션 안의 여러개 엔티티 업데이트 부분적인 업데이트를 지원.
- upsertOne : 컬렉션 안의 하나의 엔티티 추가 또는 업데이트 부분적인 업데이트를 지원.
- upsertMany : 컬렉션 안의 여러개 엔티티들을 추가 또는 업데이트. 부분적인 업데이트를 지원.
- mapOne : 컬렉션안의 하나의 엔티티를 map 함수를 선언해 업데이트
- map : 컬렉션안의 여러개의 엔티티를 map 함수를 선언해 업데이트 (Array.map함수와 비슷.)

사용 예 )
user.model.ts

```javascript
export interface User {
  id: string;
  entities: string;
}
```

user.actions.ts

```javascript
import { createAction, props } from '@ngrx/store';
import { Update, EntityMap, EntityMapOne, Predicate } from '@ngrx/entity';

import { User } from '../models/user.model';

export const loadUsers = createAction('[User/API] Load Users', props<{ users: User[] }>());
export const addUser = createAction('[User/API] Add User', props<{ user: User }>());
export const setUser = createAction('[User/API] Set User', props<{ user: User }>());
export const upsertUser = createAction('[User/API] Upsert User', props<{ user: User }>());
export const addUsers = createAction('[User/API] Add Users', props<{ users: User[] }>());
export const upsertUsers = createAction('[User/API] Upsert Users', props<{ users: User[] }>());
export const updateUser = createAction('[User/API] Update User', props<{ update: Update<User> }>());
export const updateUsers = createAction('[User/API] Update Users', props<{ updates: Update<User>[] }>());
export const mapUser = createAction('[User/API] Map User', props<{ entityMap: EntityMapOne<User> }>());
export const mapUsers = createAction('[User/API] Map Users', props<{ entityMap: EntityMap<User> }>());
export const deleteUser = createAction('[User/API] Delete User', props<{ id: string }>());
export const deleteUsers = createAction('[User/API] Delete Users', props<{ ids: string[] }>());
export const deleteUsersByPredicate = createAction('[User/API] Delete Users By Predicate', props<{ predicate: Predicate<User> }>());
export const clearUsers = createAction('[User/API] Clear Users');

```

user.reducer.ts

```javascript
import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { User } from '../models/user.model';
import * as UserActions from '../actions/user.actions';

export interface State extends EntityState<User> {
  // additional entities state properties
  selectedUserId: number | null;
}

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  selectedUserId: null,
});

const userReducer = createReducer(
  initialState,
  on(UserActions.addUser, (state, { user }) => {
    return adapter.addOne(user, state)
  }),
  on(UserActions.setUser, (state, { user }) => {
    return adapter.setOne(user, state)
  }),
  on(UserActions.upsertUser, (state, { user }) => {
    return adapter.upsertOne(user, state);
  }),
  on(UserActions.addUsers, (state, { users }) => {
    return adapter.addMany(users, state);
  }),
  on(UserActions.upsertUsers, (state, { users }) => {
    return adapter.upsertMany(users, state);
  }),
  on(UserActions.updateUser, (state, { update }) => {
    return adapter.updateOne(update, state);
  }),
  on(UserActions.updateUsers, (state, { updates }) => {
    return adapter.updateMany(updates, state);
  }),
  on(UserActions.mapUser, (state, { entityMap }) => {
    return adapter.map(entityMap, state);
  }),
  on(UserActions.mapUsers, (state, { entityMap }) => {
    return adapter.map(entityMap, state);
  }),
  on(UserActions.deleteUser, (state, { id }) => {
    return adapter.removeOne(id, state);
  }),
  on(UserActions.deleteUsers, (state, { ids }) => {
    return adapter.removeMany(ids, state);
  }),
  on(UserActions.deleteUsersByPredicate, (state, { predicate }) => {
    return adapter.removeMany(predicate, state);
  }),
  on(UserActions.loadUsers, (state, { users }) => {
    return adapter.setAll(users, state);
  }),
  on(UserActions.clearUsers, state => {
    return adapter.removeAll({ ...state, selectedUserId: null });
  })
);

export function reducer(state: State | undefined, action: Action) {
  return userReducer(state, action);
}

export const getSelectedUserId = (state: State) => state.selectedUserId;

// get the selectors
const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of user ids
export const selectUserIds = selectIds;

// select the dictionary of user entities
export const selectUserEntities = selectEntities;

// select the array of users
export const selectAllUsers = selectAll;

// select the total user count
export const selectUserTotal = selectTotal;

```

### Entity Updates

엔티티 어댑터를 사용하여 엔티티들을 업데이트 할 때 알고있어야할 몇가지 사항이 있습니다.
첫번째로 updateOne와 updateMany는 Update<T> 인터페이스를 사용하는데 이것은 부분 업데이트를 지원합니다.

```javascript
interface UpdateStr<T> {
  id: string;
  changes: Partial<T>;
}

interface UpdateNum<T> {
  id: number;
  changes: Partial<T>;
}

type Update<T> = UpdateStr<T> | UpdateNum<T>;
```

두번째로, upsertOne 과 upsertMany는 인서트나 업데이트 기능을 수행합니다.
만약, 부분 엔티티가 제공된다면 업데이트를 수행할 것입니다.
부분 업데이트, 명시적으로 모든 필드를 세팅하는 것 둘다 막기위해 사용되지 않은 필드를 undefined로 설정하거나 setOne, setAll 어뎁터 메소드를 사용합니다.

## Entity Selectors

생성된 엔티티 어뎁터로부터 반환되는 getSelectors 메소드는 엔티티로부터 정보를 셀렉트하는 함수를 제공합니다.

```javascript
import {
  createSelector,
  createFeatureSelector,
  ActionReducerMap,
} from "@ngrx/store";
import * as fromUser from "./user.reducer";

export interface State {
  users: fromUser.State;
}

export const reducers: ActionReducerMap<State> = {
  users: fromUser.reducer,
};

export const selectUserState = createFeatureSelector < fromUser.State > "users";

export const selectUserIds = createSelector(
  selectUserState,
  fromUser.selectUserIds // shorthand for usersState => fromUser.selectUserIds(usersState)
);
export const selectUserEntities = createSelector(
  selectUserState,
  fromUser.selectUserEntities
);
export const selectAllUsers = createSelector(
  selectUserState,
  fromUser.selectAllUsers
);
export const selectUserTotal = createSelector(
  selectUserState,
  fromUser.selectUserTotal
);
export const selectCurrentUserId = createSelector(
  selectUserState,
  fromUser.getSelectedUserId
);

export const selectCurrentUser = createSelector(
  selectUserEntities,
  selectCurrentUserId,
  (userEntities, userId) => userEntities[userId]
);
```
