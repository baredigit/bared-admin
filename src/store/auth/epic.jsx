import { ofType } from 'redux-observable'
import { withLatestFrom, from, of, concat } from 'rxjs'
import { switchMap, mergeMap, catchError } from 'rxjs/operators'
import api from '@api'
import { login, setAuthData, getProfile } from './reducer'
import { getSchemas } from '@store/content/reducer'
import { getAllRouters } from '@store/api/reducer'

export const getProfileEpic = (action$, state$) => action$.pipe(
  ofType(getProfile().type),
  withLatestFrom(state$),
  mergeMap(([action, state]) =>
    from(api.getProfile({ jwt: action.payload.jwt, endpoint: state.auth.endpoint })).pipe(
      switchMap((response) => {
        return concat(
          of(setAuthData({ user: response, jwt: action.payload.jwt })),
          of(getSchemas()),
          of(getAllRouters())
        )
      })
    )
  )
)

export const authEpic = action$ => action$.pipe(
  ofType(login().type),
  mergeMap(action =>
    from(api.authLocal(action.payload)).pipe(
      switchMap((response) => {
        const { user, jwt } = response

        if (!jwt) {
          throw new Error('login failed')
        }

        if (action.payload?.onLogin) {
          return concat(
            of(setAuthData({ user, jwt })),
            of(getSchemas()),
            of(getAllRouters()),
            of(action.payload.onLogin)
          )
        }

        return concat(
          of(setAuthData({ user, jwt })),
          of(getSchemas()),
          of(getAllRouters())
        )
      }),
      catchError(err => {
        console.log(err)
        return of({ type: '' })
      })
    )
  )
)
