from rest_framework.routers import DefaultRouter
from .views import HastaViewSet, FamilyViewSet, IncomeViewSet, ExpenseViewSet, CityViewSet, DistrictByCityView, NeighborhoodByDistrictView

hasta_router = DefaultRouter()
hasta_router.register('hastalar', HastaViewSet)
hasta_router.register('families', FamilyViewSet)
hasta_router.register('incomes', IncomeViewSet, basename='income')
hasta_router.register('expenses', ExpenseViewSet, basename='expense')
hasta_router.register('cities', CityViewSet, basename='city')
hasta_router.register('districts', DistrictByCityView, basename='district')
hasta_router.register('neighborhoods', NeighborhoodByDistrictView, basename='neighborhood')